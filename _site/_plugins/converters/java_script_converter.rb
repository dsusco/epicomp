require 'uglifier'

module Jekyll
  module Converters
    class JavaScriptConverter < Converter
      safe true
      priority :low

      Jekyll::Hooks.register :pages, :pre_render do |page|
        next unless page.is_a?(Jekyll::Page)

        page.converters.each do |converter|
          converter.associate_page(page) if converter.is_a?(Jekyll::Converters::JavaScriptConverter)
        end
      end

      Jekyll::Hooks.register :pages, :post_render do |page|
        next unless page.is_a?(Jekyll::Page)

        page.converters.each do |converter|
          converter.dissociate_page(page) if converter.is_a?(Jekyll::Converters::JavaScriptConverter)
        end
      end

      def associate_page(page)
        if @javascript_page
          Jekyll.logger.debug 'JavaScript Converter:',
                              "javascript_page re-assigned: #{@javascript_page.name} to #{page.name}"
          dissociate_page(page)
        else
          @javascript_page = page
          @site = @javascript_page.site rescue Jekyll.sites.last
        end
      end

      def dissociate_page(page)
        unless page.equal?(@javascript_page)
          Jekyll.logger.debug 'JavaScript Converter:',
                              "dissociating a page that was never associated #{page.name}"
        end

        @javascript_page = nil
        @site = nil
      end

      def matches(ext)
        ext =~ /^\.js$/i
      end

      def output_ext(ext)
        '.js'
      end

      def safe?
        !!@config['safe']
      end

      def javascript_config
        @javascript_config ||= @config['javascript'] || {}
      end

      def javascript_dir
        @javascript_dir ||= javascript_config['javascript_dir'].to_s.empty? ? '_javascript' : javascript_config['javascript_dir']
      end

      def javascript_load_paths
        paths = javascript_config['load_paths'].map { |load_path| File.expand_path(load_path) } rescue []
        paths = [Jekyll.sanitized_path(@site.source, javascript_dir)] + paths

        if safe?
          paths.map! { |path| Jekyll.sanitized_path(@site.source, path) }
        end

        Dir.chdir(@site.source) do
          paths = paths.flat_map { |path| Dir.glob(path) }

          paths.map! do |path|
            if safe?
              Jekyll.sanitized_path(site_source, path)
            else
              File.expand_path(path)
            end
          end
        end

        paths.uniq!
        paths << @site.theme.javascript_path if @site.theme&.javascript_path
        paths.select { |path| File.directory?(path) }
      end

      def convert(content)
        @javascript_page.data['layout'] = 'none'

        config = Jekyll::Utils.symbolize_hash_keys(
          Jekyll::Utils.deep_merge_hashes(
            { :uglifer => {} },
            javascript_config
          )
        )

        Uglifier.new(config[:uglifer]).compile(insert_imports(content))
      end

      private

      def insert_imports(content)
        content.enum_for(:scan, /^\W*=\s*(\w+)\W+([\w\/\\\-\.]+)\W*$/).map {
          { match: Regexp.last_match, insert_at: Regexp.last_match.end(0) }
        }.sort { |a, b|
          # start inserting at the end of the file so the insert_at's remain accurate as the content length changes
          b[:insert_at] <=> a[:insert_at]
        }.each { |directive|
          import_content = javascript_load_paths.reduce([]) { |files, load_path|
            files + Dir.glob(File.join(load_path, '**', directive[:match][2]))
          }.uniq.reduce('') { |import_content, file|
            import_content += File.read(file)
          }

          content.insert(directive[:insert_at], "\n#{insert_imports(import_content)}")
        }

        content
      end
    end
  end
end
