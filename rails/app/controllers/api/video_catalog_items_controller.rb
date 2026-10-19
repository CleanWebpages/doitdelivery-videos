module Api
  class VideoCatalogItemsController < ApplicationController
    # GET /api/video_catalog_items
    # Returns all records keyed by video_id — the catalog page loads this once on init.
    def index
      items = VideoCatalogItem.all.order(:video_id)
      render json: { data: items.map { |i| serialize(i) } }
    end

    # GET /api/video_catalog_items/:id  (id = video_id string, e.g. "wt-lab-client")
    def show
      item = VideoCatalogItem.find_by!(video_id: params[:id])
      render json: { data: serialize(item) }
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'not found' }, status: :not_found
    end

    # PATCH /api/video_catalog_items/:id  — upsert: creates if missing, updates if exists
    def update
      item = VideoCatalogItem.find_or_initialize_by_video_id(params[:id])
      item.assign_attributes(item_params)
      item.updated_by = current_user_identifier

      if item.save
        render json: { data: serialize(item) }
      else
        render json: { errors: item.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def item_params
      params.require(:video_catalog_item).permit(:transcript, :team_notes, :done)
    end

    def serialize(item)
      {
        video_id:   item.video_id,
        transcript: item.transcript,
        team_notes: item.team_notes,
        done:       item.done,
        updated_by: item.updated_by,
        updated_at: item.updated_at,
      }
    end

    # Uses the existing JWT auth — falls back to a label for API-key callers
    def current_user_identifier
      current_user&.email || 'api'
    rescue
      'api'
    end
  end
end
