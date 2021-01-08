Jekyll::Hooks.register :site, :post_read do |site|
  # create a multi-level pages Hash, keyed off of directory/filename
  site.data['pages'] =
    site.pages.reduce({}) do |hash, page|
      url = page.url
      url += page.name if page.index?
      hash.dig_assignment(*url.split('/'), page)
      hash
    end
end
