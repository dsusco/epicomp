module Jekyll
  module CloudinaryFilters
    def cloudinary_transformation(url, transformation)
      url.sub('/upload/') { |s| s + transformation + '/' }
    end
  end
end

Liquid::Template.register_filter(Jekyll::CloudinaryFilters)
