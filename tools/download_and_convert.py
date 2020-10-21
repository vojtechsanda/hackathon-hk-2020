import requests
import logging
from tqdm import tqdm
from lxml import etree
from sqlalchemy import create_engine, MetaData, Table, select
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy_utils import create_database, database_exists
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Text
from datetime import datetime

Base = declarative_base()

class Source(Base):
    __tablename__ = "source"
    id = Column(Integer, primary_key=True, unique=True)
    name = Column(String(255))

class Category(Base):
    __tablename__ = "category"
    id = Column(Integer, primary_key=True, unique=True)
    name = Column(String(255))

class Message(Base):
    __tablename__ = "message"
    id = Column(Integer, primary_key=True, unique=True)
    title = Column(String(255))
    body = Column(Text)
    source_id = Column(Integer, ForeignKey('source.id'))
    category_id = Column(Integer, ForeignKey('category.id'))
    published_datetime = Column(DateTime)
    expired_datetime = Column(DateTime)
    children = relationship('Instance')

class Instance(Base):
    __tablename__ = "instance"
    id = Column(Integer, primary_key=True, unique=True)
    message_id = Column(Integer, ForeignKey('message.id'))
    title = Column(String(255))
    attachment_url = Column(String(255))
    attachment_filename = Column(String(255))


def get_datetime(datetime_obj, prefix):
    date = datetime_obj.find('wtd:date', prefix).text
    time = datetime_obj.find('wtd:time', prefix).text
    datetime_str = date + ' ' + time
    return datetime_str

def download_from_url(url, dst, req=None):
    if req is None:
        req = requests.get(url, stream=True)
    file_size = int(req.headers['Content-Length'].strip())
    pbar = tqdm(
        total=file_size, initial=0,
        unit='B', unit_scale=True, desc=url.split('/')[-1])
    with(open(dst, 'wb')) as f:
        for chunk in req.iter_content(chunk_size=1024):
            if chunk:
                f.write(chunk)
                pbar.update(1024)
    pbar.close()

def download_data():
    logging.info('Downloading data...')
    download_from_url('http://www.kr-kralovehradecky.cz/xml/export/eldeska-zpravy.xml', 'data.xml')

def convert_data():
    url = 'mysql://root:@localhost/hackathon_hk_2020?charset=utf8'

    if not database_exists(url):
        create_database(url)

    engine = create_engine(url, echo=False, encoding='utf-8')
    DBSession = scoped_session(sessionmaker())
    DBSession.configure(bind=engine, autoflush=False, expire_on_commit=False)
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

    tree = etree.parse('data.xml')
    prefix_map = {"wtd": "http://www.webtodate.cz/schemas/2.0/SimpleSchema"}
    news = tree.findall('wtd:news', prefix_map)

    sources = ['Neznámý'];
    categories = []

    null_source = Source()
    null_source.name = 'Neznámý'
    DBSession.add(null_source)
    DBSession.commit()

    for row in tqdm(iterable=news, total=len(news)):
        message_obj = Message()

        title = row.find('wtd:title', prefix_map).text.strip()

        # Source
        source = row.find('wtd:source', prefix_map)
        if (source != None):
            source = source.text.strip()

            if (source not in sources):
                sources.append(source)
                source_obj = Source()
                source_obj.name = source
                DBSession.add(source_obj)
                DBSession.commit()
            source_id = sources.index(source) + 1
        else:
            source_id = 1

        # Title
        category = row.find('.//wtd:category[@name="Úřední deska"]/wtd:category', prefix_map)
        if (category != None):
            category = category.attrib['name'].strip()

            if (category not in categories):
                categories.append(category)
                category_obj = Category()
                category_obj.name = category
                DBSession.add(category_obj);
                DBSession.commit()
            category_id = categories.index(category) + 1
        else:
            category_id = None

        # Attachments
        urlprefix = row.find('.//wtd:urlprefix', prefix_map).text;
        assetsfolder = row.find('.//wtd:assetsfolder', prefix_map).text;
        instances = row.findall('.//wtd:instance', prefix_map)

        for instance in instances:
            instance_obj = Instance()
            instance_obj.title = instance.find('wtd:title', prefix_map).text;
            attachment = instance.find('.//wtd:attachment', prefix_map)
            if attachment != None:
                filename = attachment.find('wtd:filename', prefix_map).text;
                filepath = attachment.find('wtd:filepath', prefix_map).text;
                instance_obj.attachment_filename = filename
                instance_obj.attachment_url = urlprefix + '/' + assetsfolder + filepath + filename
            message_obj.children.append(instance_obj);

        # Datetimes
        datetime_published = row.find('wtd:datepublished', prefix_map);
        datetime_created = row.find('wtd:datenews', prefix_map);
        datetime_expired = row.find('wtd:dateexpired', prefix_map);

        if (datetime_published != None):
            message_obj.published_datetime = get_datetime(datetime_published, prefix_map)
        elif (datetime_created != None):
            message_obj.published_datetime = get_datetime(datetime_created, prefix_map)

        if (datetime_expired != None):
            message_obj.expired_datetime = get_datetime(datetime_expired, prefix_map)

        # Body HTML
        body = row.find('wtd:body', prefix_map);
        if (body != None):
            message_obj.body = body.text

        message_obj.title = title
        message_obj.source_id = source_id
        message_obj.category_id = category_id
        DBSession.add(message_obj)
    DBSession.commit()

if __name__ == '__main__':
    #download_data()
    convert_data()
