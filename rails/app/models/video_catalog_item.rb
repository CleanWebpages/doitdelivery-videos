class VideoCatalogItem < ApplicationRecord
  validates :video_id, presence: true, uniqueness: true

  # Find or initialize by video_id so PATCH can upsert cleanly
  def self.find_or_initialize_by_video_id(vid)
    find_or_initialize_by(video_id: vid)
  end
end
