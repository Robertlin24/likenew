import json
import logging
from typing import List, Optional


from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.schedules import SchedulesService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/schedules", tags=["schedules"])


# ---------- Pydantic Schemas ----------
class SchedulesData(BaseModel):
    """Entity data schema (for create/update)"""
    day_of_week: int
    time_slot: str
    is_available: bool = None


class SchedulesUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    day_of_week: Optional[int] = None
    time_slot: Optional[str] = None
    is_available: Optional[bool] = None


class SchedulesResponse(BaseModel):
    """Entity response schema"""
    id: int
    day_of_week: int
    time_slot: str
    is_available: Optional[bool] = None

    class Config:
        from_attributes = True


class SchedulesListResponse(BaseModel):
    """List response schema"""
    items: List[SchedulesResponse]
    total: int
    skip: int
    limit: int


class SchedulesBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[SchedulesData]


class SchedulesBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: SchedulesUpdateData


class SchedulesBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[SchedulesBatchUpdateItem]


class SchedulesBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=SchedulesListResponse)
async def query_scheduless(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query scheduless with filtering, sorting, and pagination"""
    logger.debug(f"Querying scheduless: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = SchedulesService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")
        
        result = await service.get_list(
            skip=skip, 
            limit=limit,
            query_dict=query_dict,
            sort=sort,
        )
        logger.debug(f"Found {result['total']} scheduless")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying scheduless: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=SchedulesListResponse)
async def query_scheduless_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query scheduless with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying scheduless: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = SchedulesService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        result = await service.get_list(
            skip=skip,
            limit=limit,
            query_dict=query_dict,
            sort=sort
        )
        logger.debug(f"Found {result['total']} scheduless")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying scheduless: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=SchedulesResponse)
async def get_schedules(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single schedules by ID"""
    logger.debug(f"Fetching schedules with id: {id}, fields={fields}")
    
    service = SchedulesService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Schedules with id {id} not found")
            raise HTTPException(status_code=404, detail="Schedules not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching schedules {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=SchedulesResponse, status_code=201)
async def create_schedules(
    data: SchedulesData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new schedules"""
    logger.debug(f"Creating new schedules with data: {data}")
    
    service = SchedulesService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create schedules")
        
        logger.info(f"Schedules created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating schedules: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating schedules: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[SchedulesResponse], status_code=201)
async def create_scheduless_batch(
    request: SchedulesBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple scheduless in a single request"""
    logger.debug(f"Batch creating {len(request.items)} scheduless")
    
    service = SchedulesService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} scheduless successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[SchedulesResponse])
async def update_scheduless_batch(
    request: SchedulesBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple scheduless in a single request"""
    logger.debug(f"Batch updating {len(request.items)} scheduless")
    
    service = SchedulesService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} scheduless successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=SchedulesResponse)
async def update_schedules(
    id: int,
    data: SchedulesUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing schedules"""
    logger.debug(f"Updating schedules {id} with data: {data}")

    service = SchedulesService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Schedules with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Schedules not found")
        
        logger.info(f"Schedules {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating schedules {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating schedules {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_scheduless_batch(
    request: SchedulesBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple scheduless by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} scheduless")
    
    service = SchedulesService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} scheduless successfully")
        return {"message": f"Successfully deleted {deleted_count} scheduless", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_schedules(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single schedules by ID"""
    logger.debug(f"Deleting schedules with id: {id}")
    
    service = SchedulesService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Schedules with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Schedules not found")
        
        logger.info(f"Schedules {id} deleted successfully")
        return {"message": "Schedules deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting schedules {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")