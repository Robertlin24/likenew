#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para verificar conexión a Supabase y mostrar información de configuración
"""

import os
import sys
import asyncio

def print_header():
    print("=" * 70)
    print("VERIFICACION DE CONFIGURACION SUPABASE")
    print("=" * 70)
    print()

def check_env_file():
    """Verifica archivo .env local"""
    env_path = "app/app/backend/.env"
    if os.path.exists(env_path):
        print(f"[OK] Archivo .env encontrado: {env_path}")
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line.startswith('DATABASE_URL='):
                    url = line.split('=', 1)[1]
                    # Enmascarar contraseña
                    if '@' in url:
                        parts = url.split('@')
                        user_pass = parts[0]
                        if ':' in user_pass:
                            user, password = user_pass.rsplit(':', 1)
                            masked = f"{user}:***@{parts[1]}"
                            print(f"[INFO] DATABASE_URL local: {masked}")
                        else:
                            print(f"[INFO] DATABASE_URL local: {url[:50]}...")
                    else:
                        print(f"[INFO] DATABASE_URL local: {url[:50]}...")
                    return url
        print("[ADVERTENCIA] DATABASE_URL no encontrada en .env")
    else:
        print(f"[ADVERTENCIA] Archivo .env no encontrado: {env_path}")
    return None

async def test_connection(database_url):
    """Prueba la conexión a Supabase"""
    if not database_url:
        print("\n[ERROR] No hay DATABASE_URL para probar")
        return False
    
    try:
        import asyncpg
    except ImportError:
        print("\n[ERROR] asyncpg no está instalado")
        print("   Instala con: pip install asyncpg")
        return False
    
    print("\n[CONECTANDO] Probando conexión a Supabase...")
    
    try:
        # Extraer componentes de la URL
        if 'postgresql://' in database_url:
            url_parts = database_url.replace('postgresql://', '').split('@')
            if len(url_parts) == 2:
                user_pass = url_parts[0].split(':')
                host_port_db = url_parts[1].split('/')
                if len(host_port_db) == 2:
                    host_port = host_port_db[0].split(':')
                    
                    user = user_pass[0]
                    password = user_pass[1] if len(user_pass) > 1 else ''
                    host = host_port[0]
                    port = int(host_port[1]) if len(host_port) > 1 else 5432
                    database = host_port_db[1]
                    
                    print(f"   Host: {host}")
                    print(f"   Port: {port}")
                    print(f"   Database: {database}")
                    print(f"   User: {user}")
                    
                    # Conectar
                    conn = await asyncio.wait_for(
                        asyncpg.connect(
                            host=host,
                            port=port,
                            user=user,
                            password=password,
                            database=database,
                            timeout=10
                        ),
                        timeout=15.0
                    )
                    
                    print("\n[EXITO] CONEXION EXITOSA!")
                    
                    # Probar consulta
                    version = await conn.fetchval('SELECT version()')
                    print(f"   PostgreSQL: {version.split(',')[0]}")
                    
                    await conn.close()
                    return True
                    
    except asyncio.TimeoutError:
        print("\n[ERROR] Timeout al conectar (mas de 15 segundos)")
        return False
    except asyncpg.InvalidPasswordError:
        print("\n[ERROR] Contrasena incorrecta")
        print("   Verifica la contrasena en Supabase:")
        print("   1. Ve a supabase.com")
        print("   2. Tu proyecto -> Project Settings -> Database")
        print("   3. Verifica o resetea la contrasena")
        return False
    except Exception as e:
        print(f"\n[ERROR] Error al conectar: {type(e).__name__}")
        print(f"   Detalles: {str(e)}")
        return False

def print_digitalocean_instructions():
    """Imprime instrucciones para DigitalOcean"""
    print("\n" + "=" * 70)
    print("INSTRUCCIONES PARA DIGITALOCEAN")
    print("=" * 70)
    print()
    print("1. Ve a tu App en DigitalOcean")
    print("2. Click en pestaña 'Settings'")
    print("3. Busca 'App-Level Environment Variables'")
    print("4. Click en 'Edit'")
    print("5. Agrega variable:")
    print()
    print("   Key: DATABASE_URL")
    print("   Value: postgresql://postgres.TU_REF:TU_PASSWORD@HOST_POOLER:6543/postgres")
    print("   Scope: RUN_AND_BUILD_TIME (o al menos RUN_TIME)")
    print("   Type: SECRET (si hay opcion)")
    print()
    print("6. Guarda")
    print("7. Ve a 'Overview' -> 'Actions' -> 'Force Rebuild and Deploy'")
    print()

def main():
    print_header()
    
    # Verificar .env local
    local_url = check_env_file()
    
    # Probar conexión si hay URL
    if local_url:
        result = asyncio.run(test_connection(local_url))
        if result:
            print("\n[EXITO] La conexion local funciona correctamente")
            print("   El problema esta en DigitalOcean, no en las credenciales")
        else:
            print("\n[ADVERTENCIA] La conexion local falla")
            print("   Verifica las credenciales en Supabase")
    
    # Instrucciones para DigitalOcean
    print_digitalocean_instructions()
    
    print("=" * 70)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n[ADVERTENCIA] Verificacion cancelada")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
