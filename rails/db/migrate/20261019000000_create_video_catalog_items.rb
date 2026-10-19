class CreateVideoCatalogItems < ActiveRecord::Migration[7.1]
  def change
    create_table :video_catalog_items do |t|
      t.string  :video_id,   null: false, comment: 'Matches id field in videos.json'
      t.text    :transcript,              comment: 'Approved narration script'
      t.text    :team_notes,              comment: 'Team feedback and revision notes'
      t.boolean :done,       default: false, null: false
      t.string  :updated_by,             comment: 'User ID or name of last editor'
      t.timestamps
    end

    add_index :video_catalog_items, :video_id, unique: true
  end
end
