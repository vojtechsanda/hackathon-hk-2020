import requests
import logging
from tqdm import tqdm
from lxml import etree
from sqlalchemy import create_engine, MetaData, Table, select
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy_utils import create_database, database_exists
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, Float, String, ForeignKey

Base = declarative_base()

class Message(Base):
    __tablename__ = "message"
    id = Column(Integer, primary_key=True, unique=True)
    title = Column(String(255))

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
    for row in tqdm(iterable=news, total=len(news)):
        title = row.find('wtd:title', prefix_map).text

        message = Message()
        message.title = title
        print(title)
        DBSession.add(message)
        DBSession.flush()
    DBSession.commit()

if __name__ == '__main__':
    #download_data()
    convert_data()
