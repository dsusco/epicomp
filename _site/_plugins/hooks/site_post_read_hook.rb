Jekyll::Hooks.register :site, :post_read do |site|
  # create a multi-level pages Hash, keyed off of directory/filename
  site.data['pages'] =
    site.pages.reduce({}) do |hash, page|
      url = page.url
      url += page.name if page.index?
      hash.dig_assignment(*url.split('/'), page)
      hash
    end

  # create multi-level collection Hashes, keyed off of directory, files are stored in an Array
  site.collections.each do |label, collection|
    site.data[label] =
      collection.files.reduce({}) do |hash, file|
        hash.dig_assignment(*file.url.split('/')[1..-2], [file])
        hash
      end
  end
end
