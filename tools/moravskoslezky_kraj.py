import requests
from lxml import etree
from structure import Instance, Category, Source, Message, Region
from tqdm import tqdm

# Helper function for conversion from lxml tree to datetime string
def get_datetime(datetime_obj):
    date = datetime_obj.text
    return date + ' 00:00:00'

class MoravskoslezkyKraj:
  def __init__(self, db_session):
    self.db_session = db_session

    region = Region()
    region.name = 'Moravskoslezký kraj'
    self.db_session.add(region)
    self.db_session.commit()
    self.region_id = region.id

    self.download()
    self.convert()


  def download(self):
    #print('Downloading...')
    #r = requests.get('https://www.msk.cz/ud.php')
    #open('data/moravskoslezky_kraj.xml', 'wb').write(r.content)
    #print('Downloaded')
    pass

  def convert(self):
    # Init lxml tree parsing
    tree = etree.parse('data/moravskoslezky_kraj.xml')
    rows = tree.findall('.//dokument_na_uredni_desce')

    categories = dict()
    sources = dict()

    for row in tqdm(iterable=rows, total=len(rows)):
        message_obj = Message()
        message_obj.region_id = self.region_id

        # Title
        message_obj.title = row.find('nazev').text.strip()

        # Datetimes
        datetime_published = row.find('zverejneno_od');
        datetime_expired = row.find('zverejneno_do');

        if (datetime_published != None and datetime_published.text != None):
            message_obj.published_datetime = get_datetime(datetime_published)

        if (datetime_expired != None and datetime_expired.text != None):
            message_obj.expired_datetime = get_datetime(datetime_expired)

        # Attachments
        attachments = row.findall('dokument')
        for index, attachment in enumerate(attachments):
          instance = Instance()
          instance.title = 'Příloha č. ' + str(index + 1)
          instance.attachment_url = attachment.text
          instance.attachment_filename = 'pdf'
          message_obj.children.append(instance)

        # Source
        source = row.find('organizace')
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
            source_id = None

        message_obj.source_id = source_id

        # Category
        category = row.find('agenda')
        if (category != None):
            category = category.text.strip()

            if (category not in categories):
                category_obj = Category()
                category_obj.name = category
                category_obj.region_id = self.region_id
                self.db_session.add(category_obj);
                self.db_session.commit()
                categories[category] = category_obj.id
            category_id = categories[category]
        else:
            category_id = None
        message_obj.category_id = category_id

        self.db_session.add(message_obj)
    self.db_session.commit()
