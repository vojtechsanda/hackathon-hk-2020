from pardubicky_kraj import PardubickyKraj
from kralovehradecky_kraj import KralovehradeckyKraj
from structure import Base
from sqlalchemy_utils import create_database, database_exists
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy import create_engine

if __name__ == "__main__":
  url = 'mysql://root:@localhost/hackathon_hk_2020?charset=utf8'

  if not database_exists(url):
      create_database(url)

  engine = create_engine(url, echo=False, encoding='utf-8')
  DBSession = scoped_session(sessionmaker())
  DBSession.configure(bind=engine, autoflush=False, expire_on_commit=False)
  Base.metadata.drop_all(engine)
  Base.metadata.create_all(engine)

  KralovehradeckyKraj(DBSession)
  PardubickyKraj(DBSession)

  with engine.connect() as con:
    rs = con.execute('CREATE FULLTEXT INDEX index_name ON message(title)')
