.PHONY: up down build logs stop restart clean

# Build all Docker images
build:
	docker-compose build

# Start all services
up:
	docker-compose up -d

# Stop all services
down:
	docker-compose down

# View logs for all services
logs:
	docker-compose logs -f

# View logs for a specific service (usage: make logs-backend)
logs-frontend:
	docker-compose logs -f frontend

logs-backend:
	docker-compose logs -f backend

logs-mock:
	docker-compose logs -f mock-services

# Stop services without removing containers
stop:
	docker-compose stop

# Restart all services
restart:
	docker-compose restart

# Clean up all containers and volumes
clean:
	docker-compose down -v

# Build and start fresh
fresh: clean build up
	@echo "✓ All services started fresh on ports: 3000 (frontend), 8000 (backend), 9000 (mock-services)"

help:
	@echo "Available commands:"
	@echo "  make build        - Build all Docker images"
	@echo "  make up           - Start all services in background"
	@echo "  make down         - Stop and remove all services"
	@echo "  make logs         - View logs for all services"
	@echo "  make logs-frontend - View frontend logs"
	@echo "  make logs-backend  - View backend logs"
	@echo "  make logs-mock     - View mock-services logs"
	@echo "  make stop         - Stop services without removing"
	@echo "  make restart      - Restart all services"
	@echo "  make clean        - Remove all containers and volumes"
	@echo "  make fresh        - Clean build and start fresh"
