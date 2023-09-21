const { Component } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');

class Footer extends Component {
    render() {
        const {
            logo,
            logoUrl,
            siteUrl,
            siteTitle,
            siteYear,
            author,
            links,
            showVisitorCounter,
            visitorCounterTitle
        } = this.props;

        let footerLogo = '';
        if (logo) {
            if (logo.text) {
                footerLogo = logo.text;
            } else {
                footerLogo = <img src={logoUrl} alt={siteTitle} height="28" />;
            }
        } else {
            footerLogo = siteTitle;
        }

        return <footer class="footer">
            <div class="container">
                <div class="level">
                    <div class="level-start">
                        <a class="footer-logo is-block mb-2" href={siteUrl}>
                            {footerLogo}
                        </a>
                        <p class="is-size-7">
                            <span dangerouslySetInnerHTML={{ __html: `&copy; ${siteYear} ${author || siteTitle}` }}></span>
                            &nbsp;&nbsp;Powered by <a href="https://yanmouxie.com/" target="_blank" rel="noopener">me</a>

                            <script type="text/javascript">
                            var sc_project=12924454; 
                            var sc_invisible=0; 
                            var sc_security="99db152e"; 
                            var scJsHost = "https://";
                            document.write("<sc"+"ript type='text/javascript' src='" + scJsHost+
                            "statcounter.com/counter/counter.js'></"+"script>");
                            </script>
                            <noscript><div class="statcounter"><a title="Web Analytics"
                            href="https://statcounter.com/" target="_blank"><img class="statcounter"
                            src="https://c.statcounter.com/12924454/0/99db152e/0/" alt="Web Analytics"
                            referrerPolicy="no-referrer-when-downgrade"></a></div></noscript>

                            {showVisitorCounter ? <br /> : null}
                            {showVisitorCounter ? <span id="busuanzi_container_site_uv"
                                dangerouslySetInnerHTML={{ __html: visitorCounterTitle }}></span> : null}
                        </p>
                    </div>
                    <div class="level-end">
                        {Object.keys(links).length ? <div class="field has-addons">
                            {Object.keys(links).map(name => {
                                const link = links[name];
                                return <p class="control">
                                    <a class={`button is-transparent ${link.icon ? 'is-large' : ''}`} target="_blank" rel="noopener" title={name} href={link.url}>
                                        {link.icon ? <i class={link.icon}></i> : name}
                                    </a>
                                </p>;
                            })}
                        </div> : null}
                    </div>
                </div>
            </div>
        </footer>;
    }
}

module.exports = cacheComponent(Footer, 'common.footer', props => {
    const { config, helper } = props;
    const { url_for, _p, date } = helper;
    const { logo, title, author, footer, plugins } = config;

    const links = {};
    if (footer && footer.links) {
        Object.keys(footer.links).forEach(name => {
            const link = footer.links[name];
            links[name] = {
                url: url_for(typeof link === 'string' ? link : link.url),
                icon: link.icon
            };
        });
    }

    return {
        logo,
        logoUrl: url_for(logo),
        siteUrl: url_for('/'),
        siteTitle: title,
        siteYear: date(new Date(), 'YYYY'),
        author,
        links,
        showVisitorCounter: plugins && plugins.busuanzi === true,
        visitorCounterTitle: _p('plugin.visitor_count', '<span id="busuanzi_value_site_uv">0</span>')
    };
});
