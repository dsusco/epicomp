require 'uglifier'

module Jekyll
  module Converters
    class JavaScriptConverter < Converter
      DIRECTIVES = %w(import import_directory import_tree)

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
        if @page
          Jekyll.logger.debug 'JavaScript Converter:',
                              "javascript_page re-assigned: #{@page.name} to #{page.name}"
          dissociate_page(page)
        else
          @page = page
          @site = @page.site rescue Jekyll.sites.last
        end
      end

      def dissociate_page(page)
        unless page.equal?(@page)
          Jekyll.logger.debug 'JavaScript Converter:',
                              "dissociating a page that was never associated #{page.name}"
        end

        @page = nil
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

      def load_paths
        paths = [Jekyll.sanitized_path(@site.source, javascript_dir)]
        paths += javascript_config['load_paths'].map { |load_path| File.expand_path(load_path) } rescue []

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
        @page.data['layout'] = 'none'

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
          { directive: Regexp.last_match[1],
            path: Regexp.last_match[2],
            insert_at: Regexp.last_match.end(0) }
        }.sort { |a, b|
          # start inserting at the end of the file so the insert_at's remain accurate as the content's length changes
          b[:insert_at] <=> a[:insert_at]
        }.each { |match|
          if DIRECTIVES.include?(match[:directive])
            import_content = load_paths.reduce([]) { |files, load_path|
              glob = case match[:directive]
              when 'import'
                match[:path] += '.js' unless match[:path].end_with?('.js')
                File.join(load_path, '**', match[:path])
              when 'import_directory'
                File.join(load_path, '**', match[:path], '*.js')
              when 'import_tree'
                File.join(load_path, '**', match[:path], '**', '*.js')
              end

              files + Dir.glob(glob)
            }.uniq.reduce('') { |import_content, file|
              import_content += File.read(file)
            }

            content.insert(match[:insert_at], "\n#{insert_imports(import_content)}")
          end
        }

        content
      end
    end
  end
end
