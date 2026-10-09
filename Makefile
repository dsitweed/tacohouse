.DEFAULT_GOAL := help

.PHONY: help dev dev-backend dev-frontend

help:
	@printf '%s\n' \
	  'TacoHouse development commands:' \
	  '  make dev           Start backend and frontend together' \
	  '  make dev-backend   Start the NestJS backend only' \
	  '  make dev-frontend  Start the Next.js frontend only'

dev:
	@$(MAKE) --no-print-directory --jobs=2 dev-backend dev-frontend

dev-backend:
	@cd backend && pnpm start:dev

dev-frontend:
	@cd frontend && pnpm dev
