from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from util import database_url

engine = create_engine(
    database_url, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True)
    date = Column(String)
    event = Column(String)
    approved = Column(Boolean, default=False)
    create_time = Column(DateTime, default=datetime.now)

    def dict(self):
        return {
            'id': self.id,
            'date': self.date,
            'event': self.event,
            'approved': self.approved,
            'create_time': self.create_time
        }


Base.metadata.create_all(engine)
database = SessionLocal()
