from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship

Base = declarative_base()

class Region(Base):
    __tablename__ = "region"
    id = Column(Integer, primary_key=True, unique=True)
    name = Column(String(255))

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
    region_id = Column(Integer, ForeignKey('region.id'))
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
