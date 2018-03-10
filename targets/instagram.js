/**
 * @autor Laisson R. Silveira<laisson.r.silveira@gmail.com>
 *
 * Created on 02/06/18
 */

'use strict';
const moment = require('moment');
const target = {
    url: "https://www.instagram.com",
    execute: (crawlerTest, sendResult) => {
        crawlerTest.start();

        function populatePosts() {
            const media = _sharedData.entry_data.ProfilePage[0].user.media;
            const dadosUser = window._sharedData.entry_data.ProfilePage[0].user;

            window.scrohla = {
                qtdPosts: media.count,
                posts: [],
                dadosUser
            };

            //Fazendo adaptação do retorno do json, para que todas as publicacoes e primeiros posts fiquem iguais.
            media.nodes.forEach(item => {
                item.edge_media_to_comment = item.comments;
                item.edge_media_preview_like = item.likes;
                item.shortcode = item.code;

                let edge_media_to_caption = {
                    edges: [
                        {
                            node: {
                                text: item.caption
                            }
                        }
                    ]
                };

                item.edge_media_to_caption = edge_media_to_caption;
                item.taken_at_timestamp = item.date;
                window.scrohla.posts.push({node: item});
            });

            console.log('1 - ' + window.scrohla.posts.length);

            //Aqui é a parte responsável por concatenar os 12 primeiros posts com todas as publicacoes do instagram.
            var origOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function () {
                this.addEventListener("load", function () {
                    const response = JSON.parse(this.responseText);
                    console.log('onLoad');
                    if (response.data) {
                        console.log('Antes - ' + window.scrohla.posts.length);
                        window.scrohla.posts = window.scrohla.posts.concat(response.data.user.edge_owner_to_timeline_media.edges);
                        console.log('Depois - ' + window.scrohla.posts.length);
                    }
                });
                origOpen.apply(this, arguments);
            };

            console.log('qtdPosts' + window.scrohla.qtdPosts)
            console.log('totalPosts' + window.scrohla.posts.length)

            return {
                qtdPosts: window.scrohla.qtdPosts,
                totalPosts: window.scrohla.posts.length,
                dadosUser: window.scrohla.dadosUser
            }
        };

        function scroll() {
            crawlerTest.driver.sleep(2000);
            crawlerTest.driver.executeScript(function () {
                window.scrollTo(0, 500000);
                return {
                    qtdPosts: window.scrohla.qtdPosts,
                    totalPosts: window.scrohla.posts.length
                };
            }).then(result => {
                console.log(`Coletando ${result.totalPosts} de ${result.qtdPosts}`);
                if (result.totalPosts < result.qtdPosts) {
                    scroll();
                }
            });
        };

        function getPosts() {
            return crawlerTest.driver.executeScript(function () {
                return window.scrohla.posts;
            });
        };

        function getDadosUser() {
            return crawlerTest.driver.executeScript(function () {
                return window.scrohla.dadosUser;
            });
        };

        function login() {
            crawlerTest.driver.manage().window().maximize();
            let login = ('//p[@class="_g9ean"]//a');
            crawlerTest.driver.sleep(2000);
            crawlerTest.driver.findElement(crawlerTest.By.xpath(login)).click();
            let user = ('//input[@name="username"]')
            let senha = ('//input[@type="password"]');
            crawlerTest.driver.findElement(crawlerTest.By.xpath(user)).sendKeys("contateste9915");
            crawlerTest.driver.findElement(crawlerTest.By.xpath(senha)).sendKeys("99151767");
            let botao = ('//button[@class="_qv64e _gexxb _4tgw8 _njrw0"]');
            crawlerTest.driver.findElement(crawlerTest.By.xpath(botao)).click();
            crawlerTest.driver.sleep(1000);
            crawlerTest.driver.get('https://www.instagram.com/kadalsasso');
            // crawlerTest.driver.get('https://www.instagram.com/laissonsilveira');
            // crawlerTest.driver.get('https://www.instagram.com/contateste9915');
        }

        function init() {
            crawlerTest.driver.executeScript(populatePosts).then(result => {
                if (result.totalPosts < result.qtdPosts) {
                    scroll();
                }
                getPosts().then(posts => {
                    getDadosUser().then(dados => {
                        let instagram = {};
                        instagram.hora_coleta = new Date();
                        let minhasPublicacoes = [];
                        let meusDados = [];
                        let somaLike = 0;
                        let somaComentario = 0;
                        let mediaLikes = 0;
                        let mediaComentarios = 0;
                        for (let i = 0; i < posts.length; i++) {
                            //Pegando a quantidade total de likes no instagram.
                            let qtdLikes = posts[i].node.edge_media_preview_like.count;
                            somaLike = somaLike + qtdLikes;

                            //Pegando a quantidade total de comentarios no instagram.
                            let qtdComentarios = posts[i].node.edge_media_to_comment.count;
                            somaComentario = somaComentario + qtdComentarios;

                            //Pegando a média de curtidas do instagram.
                            mediaLikes = somaLike / posts.length;

                            //Pegando a média de comentários do instagram.
                            mediaComentarios = somaComentario / posts.length;


                            //Objeto responsável por pegar todas as publicações.
                            let pup = {
                                qtdLikes: posts[i].node.edge_media_preview_like.count,
                                qtdComentarios: posts[i].node.edge_media_to_comment.count,
                                legenda: posts[i].node.edge_media_to_caption.edges[0] ? posts[i].node.edge_media_to_caption.edges[0].node.text : null,
                                dataPublicacao: moment(new Date(posts[i].node.taken_at_timestamp * 1000)).format('DD/MM/YYYY HH:mm:ss'),
                                thumbnail: posts[i].node.thumbnail_src,
                                thumbnail150x150: posts[i].node.thumbnail_resources[0].src,
                                thumbnail240x240: posts[i].node.thumbnail_resources[1].src,
                                thumbnail320x320: posts[i].node.thumbnail_resources[2].src,
                                thumbnail480x480: posts[i].node.thumbnail_resources[3].src,
                                thumbnail640x640: posts[i].node.thumbnail_resources[4].src,
                                shortcode: posts[i].node.shortcode,
                                isVideo: posts[i].node.is_video

                            }
                            minhasPublicacoes.push(pup);
                        }

                        // Objeto responsavel por pegar as informações do user.
                        let infoDados = {
                            username: result.dadosUser.username,
                            qtdSeguindo: result.dadosUser.follows.count,
                            qtdSeguidores: result.dadosUser.followed_by.count,
                            biografia: result.dadosUser.biography,
                            site: result.dadosUser.external_url,
                            nome: result.dadosUser.full_name,
                            contaVerificada: result.dadosUser.is_verified,
                            contaPrivada: result.dadosUser.is_private,
                            fotoPerfilHd: result.dadosUser.profile_pic_url_hd,
                            fotoPerfil: result.dadosUser.profile_pic_url,
                            qtdPublicacoes: result.dadosUser.media.count
                        }
                        meusDados.push(infoDados);


                        instagram.publicacoes = minhasPublicacoes;
                        instagram.dados = meusDados;
                        instagram.totalLikesInstagram = somaLike;
                        instagram.totalComentariosInstagram = somaComentario;
                        instagram.mediaLikes = mediaLikes;
                        instagram.mediaComentarios = mediaComentarios;

                        crawlerTest.flow(() => {
                            sendResult(instagram);
                        });
                    });
                });
            })
        }

        login();
        init();
    }
};

exports.target = target;