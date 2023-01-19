#!/usr/bin/env ruby
require 'cloudinary'
require 'yaml'

Cloudinary.config(YAML.load(File.read('_cloudinary.yml')))

dir = './epicomp/'
# YEAR/CATEGORY/CAPTION - ARTIST.jpg
images = Dir["#{dir}**/*.jpg"]#[1, 1]

for image in images do
  public_id = image.sub(dir, '')
  puts public_id
  year, category, filename = *public_id.split('/')
  alt = filename.delete_suffix('.jpg').split(' - ')
  artist = alt.pop
  caption = alt.join(' - ')
  alt = "#{caption} - #{artist}"

  puts Cloudinary::Uploader.upload(image, {
    public_id: "#{year}/#{category}/#{alt}",
    tags: [year, category],
    context: {
      alt: alt,
      artist: artist,
      caption: caption,
      category: category,
      year: year
    }
  })
end
