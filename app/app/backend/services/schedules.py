import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.schedules import Schedules

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class SchedulesService:
    """Service layer for Schedules operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[Schedules]:
        """Create a new schedules"""
        try:
            obj = Schedules(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created schedules with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating schedules: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Schedules]:
        """Get schedules by ID"""
        try:
            query = select(Schedules).where(Schedules.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching schedules {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of scheduless"""
        try:
            query = select(Schedules)
            count_query = select(func.count(Schedules.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Schedules, field):
                        query = query.where(getattr(Schedules, field) == value)
                        count_query = count_query.where(getattr(Schedules, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Schedules, field_name):
                        query = query.order_by(getattr(Schedules, field_name).desc())
                else:
                    if hasattr(Schedules, sort):
                        query = query.order_by(getattr(Schedules, sort))
            else:
                query = query.order_by(Schedules.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching schedules list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Schedules]:
        """Update schedules"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Schedules {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated schedules {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating schedules {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete schedules"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Schedules {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted schedules {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting schedules {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Schedules]:
        """Get schedules by any field"""
        try:
            if not hasattr(Schedules, field_name):
                raise ValueError(f"Field {field_name} does not exist on Schedules")
            result = await self.db.execute(
                select(Schedules).where(getattr(Schedules, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching schedules by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Schedules]:
        """Get list of scheduless filtered by field"""
        try:
            if not hasattr(Schedules, field_name):
                raise ValueError(f"Field {field_name} does not exist on Schedules")
            result = await self.db.execute(
                select(Schedules)
                .where(getattr(Schedules, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Schedules.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching scheduless by {field_name}: {str(e)}")
            raise