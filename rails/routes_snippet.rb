# Add inside the existing `namespace :api` block in config/routes.rb
#
# resources :video_catalog_items, param: :id, only: [:index, :show, :update]
#
# This gives:
#   GET    /api/video_catalog_items        -> index  (all records)
#   GET    /api/video_catalog_items/:id    -> show   (one record by video_id)
#   PATCH  /api/video_catalog_items/:id    -> update (upsert transcript/notes/done)
#
# Note: :id here is the video_id string (e.g. "wt-lab-client"), not a database integer id.
# The controller uses find_by!(video_id: params[:id]) accordingly.
