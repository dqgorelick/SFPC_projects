var journal = [
  {
    date: 'Oct 12',
    code: "\
    #\
    # This file contains configuration flags to customize your site\
    #\
    \
    # Name of your site (displayed in the header)\
    name: Daniel Gorelick\
    \
    # Short bio or description (displayed in the header)\
    description: Web Developer from Somewhere\
    \
    # URL of your avatar or profile pic (you could use your GitHub profile pic)\
    avatar: https://raw.githubusercontent.com/barryclark/jekyll-now/master/images/jekyll-logo.png\
    \
    #\
    # Flags below are optional\
    #\
    \
    # Includes an icon in the footer for each username you enter\
    footer-links:\
      email:\
      facebook:\
      github: barryclark/jekyll-now\
      instagram:\
      linkedin:\
      rss: # just type anything here for a working RSS icon\
      twitter: dqgorelick\
    \
    # Enter your Google Analytics web tracking code (e.g. UA-2110908-2) to activate tracking\
    google_analytics:\
    \
    # Your website URL (e.g. http://barryclark.github.io or http://www.barryclark.co)\
    # Used for Sitemap.xml and your RSS feed\
    url: \"http://danielgorelick.com\"\
    \
    # If you're hosting your site at a Project repository on GitHub pages\
    # (http://yourusername.github.io/repository-name)\
    # and NOT your User repository (http://yourusername.github.io)\
    # then add in the baseurl here, like this: \"/repository-name\"\
    baseurl: \"\"\
    \
    #\
    # !! You don't need to change any of the configuration flags below !!\
    #\
    \
    permalink: /:title/\
    \
    # The release of Jekyll Now that you're using\
    version: v1.2.0\
    \
    # Jekyll 3 now only supports Kramdown for Markdown\
    kramdown:\
      # Use GitHub flavored markdown, including triple backtick fenced code blocks\
      input: GFM\
      # Jekyll 3 and GitHub Pages now only support rouge for syntax highlighting\
      syntax_highlighter: rouge\
      syntax_highlighter_opts:\
        # Use existing pygments syntax highlighting css\
        css_class: 'highlight'\
    \
    # Set the Sass partials directory, as we're using @imports\
    sass:\
      style: :expanded # You might prefer to minify using :compressed\
    \
    # Use the following plug-ins\
    gems:\
      - jekyll-sitemap # Create a sitemap using the official Jekyll sitemap gem\
      - jekyll-feed # Create an Atom feed using the official Jekyll feed gem\
    \
    # Exclude these files from your production _site\
    exclude:\
      - Gemfile\
      - Gemfile.lock\
      - LICENSE\
      - README.md\
      - CNAME\
      - assets/\
      - node_modules/\
      - src/\
      - projects/\
      - server.js\
      - webpack.config.js\
      - webpack.production.config.js\
          file: \"_includes/analytics.html\"\
    {% if site.google_analytics %}\
        <!-- Google Analytics -->\
        <script>\
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){\
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\
            })(window,document,'script','//www.google-analytics.com/analytics.js','ga');\
    \
            ga('create', '{{ site.google_analytics }}', 'auto');\
            ga('send', 'pageview', {\
              'page': '{{ site.baseurl }}{{ page.url }}',\
              'title': '{{ page.title | replace: \"'\", \"\\'\" }}'\
            });\
        </script>\
        <!-- End Google Analytics -->\
    {% endif %}\
          file: \"_includes/meta.html\"\
        <meta charset=\"utf-8\" />\
        <meta content='text/html; charset=utf-8' http-equiv='Content-Type'>\
        <meta http-equiv='X-UA-Compatible' content='IE=edge'>\
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0'>\
    \
        {% if page.excerpt %}\
        <meta name=\"description\" content=\"{{ page.excerpt| strip_html }}\" />\
        <meta property=\"og:description\" content=\"{{ page.excerpt| strip_html }}\" />\
        {% else %}\
        <meta name=\"description\" content=\"{{ site.description }}\">\
        <meta property=\"og:description\" content=\"{{ site.description }}\" />\
        {% endif %}\
        <meta name=\"author\" content=\"{{ site.name }}\" />\
    \
        {% if page.title %}\
        <meta property=\"og:title\" content=\"{{ page.title }}\" />\
        <meta property=\"twitter:title\" content=\"{{ page.title }}\" />\
        {% endif %}\
          file: \"_includes/svg-icons.html\"\
    {% if site.footer-links.dribbble %}<a href=\"https://dribbble.com/{{ site.footer-links.dribbble }}\"><i class=\"svg-icon dribbble\"></i></a>{% endif %}\
    {% if site.footer-links.email %}<a href=\"mailto:{{ site.footer-links.email }}\"><i class=\"svg-icon email\"></i></a>{% endif %}\
    {% if site.footer-links.facebook %}<a href=\"https://www.facebook.com/{{ site.footer-links.facebook }}\"><i class=\"svg-icon facebook\"></i></a>{% endif %}\
    {% if site.footer-links.flickr %}<a href=\"https://www.flickr.com/{{ site.footer-links.flickr }}\"><i class=\"svg-icon flickr\"></i></a>{% endif %}\
    {% if site.footer-links.github %}<a href=\"https://github.com/{{ site.footer-links.github }}\"><i class=\"svg-icon github\"></i></a>{% endif %}\
    {% if site.footer-links.instagram %}<a href=\"https://instagram.com/{{ site.footer-links.instagram }}\"><i class=\"svg-icon instagram\"></i></a>{% endif %}\
    {% if site.footer-links.linkedin %}<a href=\"https://www.linkedin.com/in/{{ site.footer-links.linkedin }}\"><i class=\"svg-icon linkedin\"></i></a>{% endif %}\
    {% if site.footer-links.pinterest %}<a href=\"https://www.pinterest.com/{{ site.footer-links.pinterest }}\"><i class=\"svg-icon pinterest\"></i></a>{% endif %}\
    {% if site.footer-links.rss %}<a href=\"{{ site.baseurl }}/feed.xml\"><i class=\"svg-icon rss\"></i></a>{% endif %}\
    {% if site.footer-links.twitter %}<a href=\"https://www.twitter.com/{{ site.footer-links.twitter }}\"><i class=\"svg-icon twitter\"></i></a>{% endif %}\
    {% if site.footer-links.stackoverflow %}<a href=\"http://stackoverflow.com/{{ site.footer-links.stackoverflow }}\"><i class=\"svg-icon stackoverflow\"></i></a>{% endif %}\
    {% if site.footer-links.youtube %}<a href=\"https://youtube.com/{{ site.footer-links.youtube }}\"><i class=\"svg-icon youtube\"></i></a>{% endif %}\
    {% if site.footer-links.googleplus %}<a href=\"https://plus.google.com/{{ site.footer-links.googleplus }}\"><i class=\"svg-icon googleplus\"></i></a>{% endif %}\
          file: \"_layouts/default.html\"\
    <!DOCTYPE html>\
    <html>\
      <head>\
        <title>{% if page.title %}{{ page.title }} – {% endif %}{{ site.name }} – {{ site.description }}</title>\
    \
        {% include meta.html %}\
    \
        <!--[if lt IE 9]>\
          <script src=\"http://html5shiv.googlecode.com/svn/trunk/html5.js\"></script>\
        <![endif]-->\
        <link rel=\"stylesheet\" type=\"text/css\" href=\"{{ site.baseurl }}/dist/main.css\" />\
        <link rel=\"alternate\" type=\"application/<rss>  </rss>xml\" title=\"{{ site.name }} - {{ site.description }}\" href=\"{{ site.baseurl }}/feed.xml\" />\
      </head>\
    \
      <body>\
        <div class=\"wrapper-masthead\">\
          <div class=\"container\">\
            <header class=\"masthead clearfix\">\
              <a href=\"{{ site.baseurl }}/\" class=\"site-avatar\"><img src=\"{{ site.avatar }}\" /></a>\
    \
              <div class=\"site-info\">\
                <h1 class=\"site-name\"><a href=\"{{ site.baseurl }}/\">{{ site.name }}</a></h1>\
                <p class=\"site-description\">{{ site.description }}</p>\
              </div>\
    \
              <nav>\
                <a href=\"{{ site.baseurl }}/\">Blog</a>\
                <a href=\"{{ site.baseurl }}/about\">About</a>\
              </nav>\
            </header>\
          </div>\
        </div>\
    \
        <div id=\"main\" role=\"main\" class=\"container\">\
          {{ content }}\
        </div>\
    \
        <div class=\"wrapper-footer\">\
          <div class=\"container\">\
            <footer class=\"footer\">\
              {% include svg-icons.html %}\
            </footer>\
          </div>\
        </div>\
    \
        {% include analytics.html %}\
      </body>\
    </html>\
          file: \"_layouts/page.html\"\
    ---\
    layout: default\
    ---\
    \
    <article class=\"page\">\
    \
      <h1>{{ page.title }}</h1>\
    \
      <div class=\"entry\">\
        {{ content }}\
      </div>\
    </article>\
          file: \"_layouts/post.html\"\
    ---\
    layout: default\
    ---\
    \
    <article class=\"post\">\
      <h1>{{ page.title }}</h1>\
    \
      <div class=\"entry\">\
        {{ content }}\
      </div>\
    \
      <div class=\"date\">\
        Written on {{ page.date | date: \"%B %e, %Y\" }}\
      </div>\
    \
    </article>\
      \
          file: \"_posts/2016-10-12-Hello.md\"\
    ---\
    layout: post\
    title: You're up and running!\
    ---\
    \
    Next you can update your site name, avatar and other options using the _config.yml file in the root of your repository (shown below).\
    \
    ![_config.yml]({{ site.baseurl }}/images/config.png)\
    \
    The easiest way to make your first post is to edit this one. Go into /_posts/ and update the Hello World markdown file. For more instructions head over to the [Jekyll Now repository](https://github.com/barryclark/jekyll-now) on GitHub.\
          file: \"blog.html\"\
    ---\
    layout: default\
    ---\
    <div class=\"posts\">\
      {% for post in site.posts %}\
        <article class=\"post\">\
    \
          <h1><a href=\"{{ site.baseurl }}{{ post.url }}\">{{ post.title }}</a></h1>\
    \
          <div class=\"entry\">\
            {{ post.excerpt }}\
          </div>\
    \
          <a href=\"{{ site.baseurl }}{{ post.url }}\" class=\"read-more\">Read More</a>\
        </article>\
      {% endfor %}\
    </div>\"\
      },"
  }
]
