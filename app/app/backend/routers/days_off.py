import json
import logging
from typing import List, Optional


from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.days_off import Days_offService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/days_off", tags=["days_off"])


# ---------- Pydantic Schemas ----------
class Days_offData(BaseModel):
    """Entity data schema (for create/update)"""
    date: str
    reason: str = None


class Days_offUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    date: Optional[str] = None
    reason: Optional[str] = None


class Days_offResponse(BaseModel):
    """Entity response schema"""
    id: int
    date: str
    reason: Optional[str] = None

    class Config:
        from_attributes = True


class Days_offListResponse(BaseModel):
    """List response schema"""
    items: List[Days_offResponse]
    total: int
    skip: int
    limit: int


class Days_offBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Days_offData]


class Days_offBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Days_offUpdateData


class Days_offBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Days_offBatchUpdateItem]


class Days_offBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Days_offListResponse)
async def query_days_offs(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query days_offs with filtering, sorting, and pagination"""
    logger.debug(f"Querying days_offs: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Days_offService(db)
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
        logger.debug(f"Found {result['total']} days_offs")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying days_offs: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Days_offListResponse)
async def query_days_offs_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query days_offs with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying days_offs: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Days_offService(db)
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
        logger.debug(f"Found {result['total']} days_offs")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying days_offs: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Days_offResponse)
async def get_days_off(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single days_off by ID"""
    logger.debug(f"Fetching days_off with id: {id}, fields={fields}")
    
    service = Days_offService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Days_off with id {id} not found")
            raise HTTPException(status_code=404, detail="Days_off not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching days_off {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Days_offResponse, status_code=201)
async def create_days_off(
    data: Days_offData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new days_off"""
    logger.debug(f"Creating new days_off with data: {data}")
    
    service = Days_offService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create days_off")
        
        logger.info(f"Days_off created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating days_off: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating days_off: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Days_offResponse], status_code=201)
async def create_days_offs_batch(
    request: Days_offBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple days_offs in a single request"""
    logger.debug(f"Batch creating {len(request.items)} days_offs")
    
    service = Days_offService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} days_offs successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Days_offResponse])
async def update_days_offs_batch(
    request: Days_offBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple days_offs in a single request"""
    logger.debug(f"Batch updating {len(request.items)} days_offs")
    
    service = Days_offService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} days_offs successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Days_offResponse)
async def update_days_off(
    id: int,
    data: Days_offUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing days_off"""
    logger.debug(f"Updating days_off {id} with data: {data}")

    service = Days_offService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Days_off with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Days_off not found")
        
        logger.info(f"Days_off {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating days_off {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating days_off {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_days_offs_batch(
    request: Days_offBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple days_offs by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} days_offs")
    
    service = Days_offService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} days_offs successfully")
        return {"message": f"Successfully deleted {deleted_count} days_offs", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_days_off(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single days_off by ID"""
    logger.debug(f"Deleting days_off with id: {id}")
    
    service = Days_offService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Days_off with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Days_off not found")
        
        logger.info(f"Days_off {id} deleted successfully")
        return {"message": "Days_off deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting days_off {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")