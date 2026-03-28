#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Comprueba que DATABASE_URL (PostgreSQL) funciona con asyncpg.
Sirve para DigitalOcean Managed DB, Supabase u cualquier Postgres compatible.
(Nombre histórico del archivo: test_supabase_connection.py)
"""

import asyncio
import os
import sys
from pathlib import Path

# Configurar codificación UTF-8 para Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Agregar el directorio backend al path para importar módulos
backend_path = Path(__file__).parent / "app" / "app" / "backend"
sys.path.insert(0, str(backend_path))

async def test_connection():
    """Prueba la conexión usando DATABASE_URL."""
    print("=" * 60)
    print("VERIFICACION DE CONEXION POSTGRESQL (DATABASE_URL)")
    print("=" * 60)
    
    # Cargar variables de entorno desde .env
    env_file = backend_path / ".env"
    if env_file.exists():
        print(f"\n[OK] Archivo .env encontrado: {env_file}")
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()
    else:
        print(f"\n[ADVERTENCIA] Archivo .env no encontrado en: {env_file}")
        print("   Usando variables de entorno del sistema...")
    
    # Obtener DATABASE_URL
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("\n[ERROR] DATABASE_URL no esta configurada")
        print("   Asegúrate de tener DATABASE_URL en el archivo .env o como variable de entorno")
        return False
    
    # Mostrar URL (enmascarada)
    masked_url = database_url.split('@')[0].split(':')
    if len(masked_url) >= 3:
        masked_url[2] = '***'
        masked_display = ':'.join(masked_url) + '@' + database_url.split('@')[1] if '@' in database_url else database_url
    else:
        masked_display = database_url[:50] + '...'
    
    print(f"\n[INFO] DATABASE_URL (enmascarada): {masked_display}")
    
    # Normalizar URL para asyncpg
    if database_url.startswith('postgresql://'):
        async_url = database_url.replace('postgresql://', 'postgresql+asyncpg://', 1)
    else:
        async_url = database_url
    
    print(f"\n[INFO] URL normalizada para asyncpg: {async_url.split('@')[0]}@***")
    
    # Intentar importar módulos necesarios
    try:
        import asyncpg
        print("\n[OK] Modulo asyncpg disponible")
    except ImportError:
        print("\n[ERROR] asyncpg no esta instalado")
        print("   Instala con: pip install asyncpg")
        return False
    
    # Intentar conexión
    print("\n[CONECTANDO] Intentando conectar al servidor PostgreSQL...")
    try:
        # Extraer componentes de la URL
        if 'postgresql+asyncpg://' in async_url:
            url_parts = async_url.replace('postgresql+asyncpg://', '').split('@')
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
                    
                    # Probar una consulta simple
                    print("\n[CONSULTA] Ejecutando consulta de prueba...")
                    version = await conn.fetchval('SELECT version()')
                    print(f"   PostgreSQL version: {version.split(',')[0]}")
                    
                    # Verificar tablas existentes
                    tables = await conn.fetch("""
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = 'public'
                        ORDER BY table_name
                    """)
                    
                    if tables:
                        print(f"\n[TABLAS] Tablas encontradas ({len(tables)}):")
                        for table in tables[:10]:  # Mostrar máximo 10
                            print(f"   - {table['table_name']}")
                        if len(tables) > 10:
                            print(f"   ... y {len(tables) - 10} mas")
                    else:
                        print("\n[TABLAS] No hay tablas en la base de datos (esto es normal si es nueva)")
                    
                    await conn.close()
                    print("\n[EXITO] Verificacion completada exitosamente")
                    return True
                    
    except asyncio.TimeoutError:
        print("\n[ERROR] Timeout al conectar (mas de 15 segundos)")
        print("   Verifica red, firewall (Trusted sources en DO) y que el host sea alcanzable")
        return False
    except asyncpg.InvalidPasswordError:
        print("\n[ERROR] Contrasena incorrecta")
        print("   Verifica que la contrasena en DATABASE_URL sea correcta")
        return False
    except asyncpg.InvalidCatalogNameError:
        print("\n[ERROR] Base de datos no encontrada")
        print("   Verifica el nombre de la base en la URI (p. ej. defaultdb en DigitalOcean)")
        return False
    except Exception as e:
        print(f"\n[ERROR] Error al conectar: {type(e).__name__}")
        print(f"   Detalles: {str(e)}")
        return False

if __name__ == "__main__":
    try:
        result = asyncio.run(test_connection())
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        print("\n\n[ADVERTENCIA] Verificacion cancelada por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] ERROR INESPERADO: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
