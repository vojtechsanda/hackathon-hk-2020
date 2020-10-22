from utils import download_from_url
import re
from structure import Message, Region, Instance, Source, Category
import datetime

def get_datetime(date_str):
  time = datetime.datetime.strptime(date_str, '%d.%m.%Y')
  return time.strftime('%Y-%m-%d %H:%M:%S')

class PardubickyKraj:
  def __init__(self, db_session):
    self.db_session = db_session

    region = Region()
    region.name = 'Pardubický kraj'
    self.db_session.add(region)
    self.db_session.commit()
    self.region_id = region.id

    self.download()
    self.convert()

  def download(self):
    download_from_url('https://deska.pardubickykraj.cz/desk_print.aspx', 'data/pardubicky_kraj.xml')

  def convert(self):
    data_file = open('data/pardubicky_kraj.xml', encoding="utf-8")
    data = data_file.readlines()

    # Create regex patterns
    title_pattern = re.compile(r'<h3>(.*)<\/h3>')
    description_pattern = re.compile(r'<div class=\'itmListAnnot\'>(.*)<\/div>')
    start_date_pattern = re.compile(r'<strong>Vyvěšeno:<\/strong> (.*)')
    end_date_pattern = re.compile(r' - (.*)<br\/>')
    source_pattern = re.compile(r'<div class=\'publicDepartment\'><strong>Vystavil: <\/strong>(.*)<\/div>')
    attachment_pattern = re.compile(r'<a href=\'(.*)\' alt=')

    sources = dict()

    default_category = Category()
    default_category.name = 'Ostatní'
    default_category.region_id = self.region_id
    self.db_session.add(default_category)
    self.db_session.commit()

    i = 0
    while i < len(data):
      title = title_pattern.match(data[i])
      while title == None:
        i += 1
        if (i >= len(data)):
             break
        title = title_pattern.match(data[i])
      if (title != None):
        message_obj = Message()
        message_obj.region_id = self.region_id
        message_obj.title = title.group(1)
        message_obj.category_id = default_category.id
        self.db_session.add(message_obj)
      else:
        continue
      i += 1
      description = description_pattern.match(data[i])
      if (description != None):
        #message_obj
        pass
      else:
        continue
      i += 2
      start_date = start_date_pattern.match(data[i])
      if (start_date != None):
        message_obj.published_datetime = get_datetime(start_date.group(1))
      else:
        continue
      i += 1
      end_date = end_date_pattern.match(data[i])
      if (end_date != None):
        message_obj.expired_datetime = get_datetime(end_date.group(1))
      i += 1
      source = source_pattern.match(data[i])
      if (source != None):
        source = source.group(1)
        if source not in sources:
          source_obj = Source()
          source_obj.region_id = self.region_id
          source_obj.name = source
          self.db_session.add(source_obj)
          self.db_session.commit()
          sources[source] = source_obj.id
        message_obj.source_id = sources[source]
      i += 1
      attachment = attachment_pattern.match(data[i])
      if (attachment != None):
        instance = Instance()
        instance.title = 'Příloha'
        instance.attachment_url = attachment.group(1)
        instance.attachment_filename = 'pdf'
        message_obj.children.append(instance)
    self.db_session.commit()


