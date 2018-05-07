'use strict';

const LOGIN_URL = 'https://www.instagram.com/accounts/login';
const credentials = require('../credentials');

class Instagram {

    constructor(crawlerTest) {
        this._crawler = crawlerTest;
    }

    execute() {
        return new Promise(resolve => {

            // this.crawler.takeScreenshot();

            function populatePosts() {

                var media = _sharedData.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media;

                window.instagram = {
                    totalPosts: media.count,
                    posts: []
                };

                media.edges.forEach(function(item) {
                    window.instagram.posts.push({ node: item })
                });

                var origOpen = XMLHttpRequest.prototype.open;

                XMLHttpRequest.prototype.open = function () {

                    this.addEventListener('load', function () {
                        const response = JSON.parse(this.responseText);
                        if (response.data) {
                            window.instagram.posts = window.instagram.posts.concat(response.data.user.edge_owner_to_timeline_media.edges);
                        }
                    });

                    origOpen.apply(this, arguments);

                };

                return {
                    totalPosts: window.instagram.totalPosts,
                    totalFound: window.instagram.posts.length
                };
            }

            this._crawler.authenticate({
                loginURL: LOGIN_URL,
                user: {
                    xpath: "(//input[ @name='username' ])[1]",
                    data: credentials.user
                },
                pass: {
                    xpath: "(//input[@type='password'])[1]",
                    data: credentials.pass
                },
                cookies: true
            });

            this._crawler.goTo(Instagram.URL);

            this._crawler.sleep(5000);

            this._crawler.executeInflow(() => this._crawler.loggerInfo('Iniciando execução script..'));

            this._crawler.executeScript(populatePosts).then(result => {

                this._crawler.loggerInfo(`Coletando ${result.totalFound} de ${result.totalPosts}`, false);

                if (result.totalFound < result.totalPosts) {
                    this.scroll();
                }

                this.getPosts().then(posts => {
                    resolve(posts);
                });

            });
        });
    }

    getPosts() {
        return this._crawler.executeScript(function () {
            return window.instagram.posts;
        });
    }

    scroll() {

        this._crawler.loggerInfo("Scrolling...");
        this._crawler.executeScript(function () {
            window.scrollTo(0, 500000);
        });

        this._crawler.sleep(5000);

        this._crawler.executeScript(function () {
            return {
                totalPosts: window.instagram.totalPosts,
                totalFound: window.instagram.posts.length
            };
        }).then(result => {
            if (result.totalPosts > result.totalFound) {
                this.scroll();
            }
            this._crawler.loggerInfo(`Coletando ${result.totalFound} de ${result.totalPosts}`, false);
        });

    }

    static get URL() {
        return 'https://www.instagram.com/oberoninsta/';
    }

}

module.exports = Instagram;