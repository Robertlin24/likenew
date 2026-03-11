from core.database import Base
from sqlalchemy import Boolean, Column, Integer, String


class Schedules(Base):
    __tablename__ = "schedules"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    day_of_week = Column(Integer, nullable=False)
    time_slot = Column(String, nullable=False)
    is_available = Column(Boolean, nullable=True)