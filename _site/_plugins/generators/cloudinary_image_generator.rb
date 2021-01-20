module Jekyll
  class CloudinaryImageGenerator < Generator
    require 'cloudinary'
    require 'yaml'

    priority :highest

    Cloudinary.config(YAML.load(File.read('_cloudinary.yml')))

    def generate(site)
      site.data['images'] = []
      next_cursor = nil

      loop do
        response = Cloudinary::Api.resources({
          type: :upload,
          max_results: 500,
          next_cursor: next_cursor,
          tags: true,
          context: true
        })

        site.data['images'] += response['resources']
        next_cursor = response['next_cursor']

        break if next_cursor.nil?
      end

      # reduce the images array to an array of their tags, and keep the years
      site.data['years'] =
        site.data['images']
          .reduce([]) { |years, image| years | image['tags'] }
          .filter { |tag| tag.scan(/\D/).empty? }
    end
  end
end
