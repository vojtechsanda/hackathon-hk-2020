from utils import download_from_url
import re
from structure import Message, Region

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
    data_file = open('data2.html', encoding="utf-8")
    data = data_file.readlines()

    i = 0
    while i < len(data):
        name = re.search(r'<h3>(.*)<\/h3>', data[i])
        while name == None:
            i += 1
            if (i >= len(data)):
                break
            name = re.search(r'<h3>(.*)<\/h3>', data[i])
        if (name != None):
            message_obj = Message()
            message_obj.region_id = self.region_id
            message_obj.title = name.group(1)
            self.db_session.add(message_obj)
        i += 1
        #i += 1
        #description = re.search(r'<div class=\'itmListAnnot\'>(.*)<\/div>', data[i])
        #i += 2
        #start_date = re.search(r'<strong>Vyvěšeno:<\/strong> (.*)', data[i])
        #i += 1
        #end_date = re.search(r' - (.*)<br\/>', data[i])
        #i += 1
        #source = re.search(r'<div class=\'publicDepartment\'><strong>Vystavil: <\/strong>(.*)<\/div>', data[i])
        #i += 1
        #attachment = re.search(r'<a href=\'(.*)\' alt=', data[i])
    self.db_session.commit()
