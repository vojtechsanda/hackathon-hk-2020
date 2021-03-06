from utils import download_from_url
from lxml import etree
from structure import Instance, Category, Source, Message, Region
from tqdm import tqdm

# Helper function for conversion from lxml tree to datetime string
def get_datetime(datetime_obj, prefix):
    date = datetime_obj.find('wtd:date', prefix).text
    time = datetime_obj.find('wtd:time', prefix).text
    datetime_str = date + ' ' + time
    return datetime_str


class KralovehradeckyKraj:
    def __init__(self, db_session):
        self.db_session = db_session

        region = Region()
        region.name = 'Královéhradecký kraj'
        self.db_session.add(region)
        self.db_session.commit()
        self.region_id = region.id

        self.download()
        self.convert()

    def download(self):
        download_from_url(
            'http://www.kr-kralovehradecky.cz/xml/export/eldeska-zpravy.xml', 'data/kralovehradecky_kraj.xml')

    def convert(self):
        # Init lxml tree parsing
        tree = etree.parse('data/kralovehradecky_kraj.xml')
        prefix_map = {
            "wtd": "http://www.webtodate.cz/schemas/2.0/SimpleSchema"}
        news = tree.findall('wtd:news', prefix_map)

        # Create dummy source
        null_source = Source()
        null_source.name = 'Neznámý'
        null_source.region_id = self.region_id
        self.db_session.add(null_source)
        self.db_session.commit()

        categories = dict()
        sources = dict()

        for row in tqdm(iterable=news, total=len(news)):
            message_obj = Message()
            message_obj.region_id = self.region_id

            # Title
            message_obj.title = row.find('wtd:title', prefix_map).text.strip()

            # Source
            source = row.find('wtd:source', prefix_map)
            if (source != None):
                source = source.text.strip()

                if (source not in sources):
                    source_obj = Source()
                    source_obj.name = source
                    source_obj.region_id = self.region_id
                    self.db_session.add(source_obj)
                    self.db_session.commit()
                    sources[source] = source_obj.id
                source_id = sources[source]
            else:
                source_id = null_source.id
            message_obj.source_id = source_id

            # Category
            category = row.find(
                './/wtd:category[@name="Úřední deska"]/wtd:category', prefix_map)
            if (category != None):
                category = category.attrib['name'].strip()

                if (category not in categories):
                    category_obj = Category()
                    category_obj.name = category
                    category_obj.region_id = self.region_id
                    self.db_session.add(category_obj)
                    self.db_session.commit()
                    categories[category] = category_obj.id
                category_id = categories[category]
            else:
                category_id = None
            message_obj.category_id = category_id

            # Attachments
            urlprefix = row.find('.//wtd:urlprefix', prefix_map).text
            assetsfolder = row.find('.//wtd:assetsfolder', prefix_map).text
            instances = row.findall('.//wtd:instance', prefix_map)

            for instance in instances:
                instance_obj = Instance()
                instance_obj.title = instance.find(
                    'wtd:title', prefix_map).text
                attachment = instance.find('.//wtd:attachment', prefix_map)
                if attachment != None:
                    filename = attachment.find('wtd:filename', prefix_map).text
                    filepath = attachment.find('wtd:filepath', prefix_map).text
                    instance_obj.attachment_filename = filename
                    instance_obj.attachment_url = urlprefix + \
                        '/' + assetsfolder + filepath + filename
                message_obj.children.append(instance_obj)

            # Datetimes
            datetime_published = row.find('wtd:datepublished', prefix_map)
            datetime_created = row.find('wtd:datenews', prefix_map)
            datetime_expired = row.find('wtd:dateexpired', prefix_map)

            if (datetime_published != None):
                message_obj.published_datetime = get_datetime(
                    datetime_published, prefix_map)
            elif (datetime_created != None):
                message_obj.published_datetime = get_datetime(
                    datetime_created, prefix_map)

            if (datetime_expired != None):
                message_obj.expired_datetime = get_datetime(
                    datetime_expired, prefix_map)

            # Body HTML
            body = row.find('wtd:body', prefix_map)
            if (body != None):
                message_obj.body = body.text

            self.db_session.add(message_obj)
        self.db_session.commit()
