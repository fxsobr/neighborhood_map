var mapa;
var OPEN_WEATHER_MAP_TOKEN = '51841b7e49daed9b7acb1cad1715b879';


var Mapas = function (data) {
    var self = this;

    this.nome = ko.observable(data.nome);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    this.estadoMarcador = ko.observable(true);
    this.condicaoTempo = ko.observable();
    this.umidade = ko.observable();
    this.vento = ko.observable();
    this.pressao = ko.observable();
    this.cidade = ko.observable();

    /*
    Realiza busca na API do open weathermap através da latitute e longitude do local, mostrando ao usuário, a condição climática e a temperatura.
    */
    var climatempoURL = 'http://api.openweathermap.org/data/2.5/weather?lat='+ data.lat +'&lon='+ data.lng +'&appid='+ OPEN_WEATHER_MAP_TOKEN +'&lang=pt_br';
    ko.computed(function () {
        $.ajax(climatempoURL, {
            success: function (data) {
                var resultado = data;
                console.log(resultado);
                self.condicaoTempo = resultado.weather[0].description;
                self.umidade = resultado.main.humidity;
                self.vento = resultado.wind.speed;
                self.pressao = resultado.main.pressure;
                self.cidade = resultado.name;
            }
        }).done(function () {
            self.conteudoInformacaoEscola = "<h5>" + self.nome() + "</h5><br/>" +
                "<p style='font-size: 18px'>" + "Clima: "+ self.condicaoTempo + "</p>" +
                "<p style='font-size: 12px'>" + "Umidade: " + self.umidade + "</p>" +
                "<p style='font-size: 12px'>" + "Vento: " + self.vento + "</p>" +
                "<p style='font-size: 12px'>" + "Pressão: " + self.pressao + "</p>" +
                "<p style='font-size: 12px'>" + "Cidade: " + self.cidade + "</p>";
        }).fail(function () {
            alert("erro")
        });
    }, this);

    this.marcador = new google.maps.Marker({
        position: new google.maps.LatLng(data.lat, data.lng),
        map: mapa,
        title: data.nome,
        animation: google.maps.Animation.DROP
    });


    this.informacaoEscola = new google.maps.InfoWindow({content: self.conteudoInformacaoEscola});

    this.marcador.addListener('click', function () {
        self.informacaoEscola.setContent(self.conteudoInformacaoEscola);
        self.informacaoEscola.open(mapa, this);
        self.marcador.setAnimation(google.maps.Animation.BOUNCE);
    });

    this.mostraMarcadorInstituicao = ko.computed(function () {
        if (this.estadoMarcador() === true) {
            this.marcador.setMap(mapa);
        } else {
            this.marcador.setMap(null);
        }
        return true;
    }, this);

};

/*
ViewModel da aplicação, contém as funcionalidades que trabalham diretamente com o frontend da aplicação
*/
function MapaViewModel() {
    var self = this;

    mapa = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -27.2180696, lng: -49.6450662},
        zoom: 13,
        styles: styles
    });

    this.listaInstituicoesEnsino = ko.observableArray([]);
    this.consultaInstituicao = ko.observable("");

    instituicoesEnsino.forEach(function (instituicaoEnsino) {
        self.listaInstituicoesEnsino.push(new Mapas(instituicaoEnsino));
    });

    self.listaInstituicaoFiltrada = self.listaInstituicoesEnsino;

    self.filtraInstituicoes = ko.computed(function () {
        var filter = self.consultaInstituicao().toLowerCase();
        if (!filter) {
            self.listaInstituicaoFiltrada().forEach(function (instituicaoEnsino) {
                instituicaoEnsino.estadoMarcador(true);
            });
            return self.listaInstituicaoFiltrada();
        } else {
            return ko.utils.arrayFilter(self.listaInstituicaoFiltrada(), function (instituicaoEnsino) {
                var string = instituicaoEnsino.nome().toLowerCase().indexOf(filter) >= 0;
                instituicaoEnsino.estadoMarcador(string);
                return string;
            });
        }
    }, self);


    this.instituicaoEnsinoSelecionada = ko.observable(this.listaInstituicoesEnsino()[0]);
    this.setInstituicaoEnsino = function (instituicaoEnsino) {
        google.maps.event.trigger(instituicaoEnsino.marcador, 'click');
    };

}

function inicializaMapa() {
    ko.applyBindings(
        new MapaViewModel());
}

function erroGoogleMaps() {
    alert("Erro ao carregar o Google Maps, por favor tente novamente!");
}
function gm_authFailure() {
    alert("Erro de Autenticação no Google Maps");
    this.estadoMarcador(false)
}
