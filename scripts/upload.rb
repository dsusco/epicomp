#!/home/dsusco/.rvm/rubies/ruby-2.7.2/bin/ruby
require 'cloudinary'
require 'yaml'

Cloudinary.config(YAML.load(File.read('_cloudinary.yml')))

dir = nil#'../epicomp-old/_site/_images/'
# YEAR/CATEGORY/CAPTION - ARTIST.jpg
images = Dir["#{dir}**/*.jpg"]#[1, 1]

for image in images do
  public_id = image.sub(dir, '')
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
