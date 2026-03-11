from core.database import Base
from sqlalchemy import Column, Integer, String


class Days_off(Base):
    __tablename__ = "days_off"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    date = Column(String, nullable=False)
    reason = Column(String, nullable=True)