module Jekyll
  # creates index pages for years and categories
  class YearAndCategoryPageGenerator < Jekyll::Generator
    def generate(site)
      site.data['years'].each do |year|
        if site.data['images'].any? { |image| image['tags'].include?(year) }
          yearPage = PageWithoutAFile.new(site, site.source, year, 'index.html')

          yearPage.data['layout'] = 'year'
          yearPage.data['title'] = "#{year}"
          yearPage.data['year'] = year
          yearPage.data['categories'] = []

          # add the page to the site as well as the pages Hash
          site.pages << yearPage
          site.data['pages'].dig_assignment(*(yearPage.url + yearPage.name).split('/'), yearPage)

          site.data['categories'].each_pair do |category_slug, category|
            if site.data['images'].any? { |image| image['tags'].include?(year) && image['tags'].include?(category_slug) }
              yearPage.data['categories'] << category_slug

              categoryPage = PageWithoutAFile.new(site, site.source, File.join(year, category_slug), 'index.html')

              categoryPage.data['layout'] = 'category'
              categoryPage.data['title'] = "#{year} #{category['title']}"
              categoryPage.data['year'] = year
              categoryPage.data['category'] = category_slug

              # add the page to the site as well as the pages Hash
              site.pages << categoryPage
              site.data['pages'].dig_assignment(*(categoryPage.url + categoryPage.name).split('/'), categoryPage)
            end
          end
        end
      end
    end
  end
end
