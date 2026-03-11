from core.database import Base
from sqlalchemy import Column, DateTime, Float, Integer, String


class Appointments(Base):
    __tablename__ = "appointments"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    trash_can_count = Column(Integer, nullable=False)
    service_price = Column(Float, nullable=False)
    address = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    appointment_date = Column(String, nullable=False)
    appointment_time = Column(String, nullable=False)
    payment_status = Column(String, nullable=True)
    appointment_status = Column(String, nullable=True)
    payment_proof_url = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)