from pardubicky_kraj import PardubickyKraj
from kralovehradecky_kraj import KralovehradeckyKraj
from moravskoslezky_kraj import MoravskoslezkyKraj
from structure import Base
from sqlalchemy_utils import create_database, database_exists
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy import create_engine

if __name__ == "__main__":
    url = 'mysql://root:@localhost/hackathon_hk_2020?charset=utf8'

    # Create DB if doesn't already exist
    if not database_exists(url):
        create_database(url)

    # Init sqlalchemy
    engine = create_engine(url, echo=False, encoding='utf-8')
    DBSession = scoped_session(sessionmaker())
    DBSession.configure(bind=engine, autoflush=False, expire_on_commit=False)
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

    # Run parsers
    KralovehradeckyKraj(DBSession)
    PardubickyKraj(DBSession)
    MoravskoslezkyKraj(DBSession)

    # Custom SQL for fulltext search
    with engine.connect() as con:
        rs = con.execute('CREATE FULLTEXT INDEX index_name ON message(title)')
