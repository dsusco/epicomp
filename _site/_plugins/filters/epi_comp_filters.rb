module Jekyll
  module EpiCompFilters
    def breadcrumb_array(url)
      url.split('/').reduce([]) { |dig_args, url_token|
        url_array = dig_args.last[0..] rescue []

        url_array.pop if url_array.last.end_with?('.html') rescue false

        url_array << url_token unless url_token.empty?

        url_array << 'index.html' if url_array.length == 0 or !url_array.last.end_with?('.html')

        dig_args << url_array
      }.map { |dig_args|
        @context.registers[:site].data['pages'].dig(*dig_args)
      }
    end
  end
end

Liquid::Template.register_filter(Jekyll::EpiCompFilters)
