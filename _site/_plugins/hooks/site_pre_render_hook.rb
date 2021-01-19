Jekyll::Hooks.register :site, :pre_render do |site|
  # create a multi-level pages Hash, keyed off of directory/filename
  site.data['pages'] =
    site.pages.sort { |a, b| a.url <=> b.url } .reduce({}) do |hash, page|
      url = page.url
      url += page.name if page.index?
      hash.dig_assignment(*url.split('/')[1..], page) if page.ext.eql?('.html')
      hash
    end
end
