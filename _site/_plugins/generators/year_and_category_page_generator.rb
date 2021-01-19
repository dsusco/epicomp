module Jekyll
  # creates index pages for years and categories
  class YearAndCategoryPageGenerator < Jekyll::Generator
    def generate(site)
      site.data['years'].each do |year|
        if site.data['images'].any? { |image| image['tags'].include?(year) }
          yearPage = PageWithoutAFile.new(site, site.source, File.join('gallery', year), 'index.html')

          yearPage.data.merge!({
            'layout' => 'year',
            'title' => "#{year}",
            'heading' => "EpiComp #{year}",
            'breadcrumb' => year,
            'year' => year,
            'categories' => [],
            'template_image' => {
              'context' => {
                'custom' => {
                  'alt' => 'EpiComp <%= year %> <%= category_title %> (Pictured: <%= image.context.custom.alt %>)'
                }
              },
              'public_id' => '<%= image.public_id %>',
              'secure_url' => "<%= image.secure_url.replace(/(\\/upload\\/)/, '$1' + transformation + '/') %>"
            }
          })

          # add the page to the site as well as the pages Hash
          site.pages << yearPage

          site.data['categories'].each_pair do |category_slug, category|
            if site.data['images'].any? { |image| image['tags'].include?(year) && image['tags'].include?(category_slug) }
              yearPage.data['categories'] << category_slug

              categoryPage = PageWithoutAFile.new(site, site.source, File.join('gallery', year, category_slug), 'index.html')

              categoryPage.data.merge!({
                'layout' => 'category',
                'breadcrumb' => category['title'],
                'title' => "#{year} #{category['title']}",
                'heading' => "EpiComp #{year} #{category['title']}",
                'year' => year,
                'category' => category_slug
              })

              # add the page to the site as well as the pages Hash
              site.pages << categoryPage
            end
          end
        end
      end
    end
  end
end
