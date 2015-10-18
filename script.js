/*global fetch*/
$(function() {
  var getFullCouncilName = function(region, name) {
    return region + ", " + name;
  }
  var getCouncilId = function(region, name) {
    return name + region;
  }
  var candidateF = fetch("data/mayor_candidates.json").then(function(response) {
    return response.json();
  });
  fetch("data/citycounsils.json").then(function(response) {
    return response.json();
  }).then(function(councils) {
  	vote2015.cityCouncils = {};
    councils.forEach(function(council) {
      var name = getFullCouncilName(council.region, council.name);
      var id = getCouncilId(council.region, council.name);
      $("#region").append("<option value='" + id + "'>" + name + "</option>");
      vote2015.cityCouncils[id] = council;
    });
  }).catch(function(error) {
    console.log(error);
  });
  
  $("#region").change(function() {
    $("#mayorCandidates").empty();
    var selectedCouncilId = $("#region").val();
    candidateF.then(function(candidates) {
      candidates.filter(function(candidate){
        var candidateCouncilId = getCouncilId(candidate.region, candidate.city_council);
        return selectedCouncilId == candidateCouncilId;
      }).forEach(function(candidate) {
        $("#mayorCandidates").append(
          "<li class='candidate'>" +
          "<span class='name'>" + candidate.full_name + "</span>" +
          "<span class='party'>" + candidate.party + "</span>"
          + "</li>")
      });
    })
  });
  
  vote2015.website.bindFunctions();

});


var vote2015 = vote2015 || {};

var words = ["заради себе.", "заради дітей.", "заради громади."],
    i = 0;


vote2015.heroAnimation = {

  textChange: function() {
    $(".who").fadeOut(function(){
      $(".who").text(words[i=(i+1)%words.length]);
      $(".who").fadeIn();
    });
  }
};

$(document).ready(function(){
  setInterval(function () {
    vote2015.heroAnimation.textChange();
  }, 2250);
});


vote2015.website = {
  bindModalClose: function() {
    var close = function(e){
      e.preventDefault();
      vote2015.website.closeModal();
    };
   $(".overlay").bind("click", close);
   $(".close").bind("click", close);

  },
  
  bindFunctions: function() {
    vote2015.website.bindCouncilSelect();
    vote2015.website.bindModalClose();
    
  },

  bindCouncilSelect: function() {
    $("select#region").bind("change", function(){
      vote2015.website.showCandidates($(this));
      $("body").addClass("no-scroll");
    });
  },
  showCandidates: function(self) {
    var selectedCouncilId = $(self).val();
    var selectedCouncilName = vote2015.cityCouncils[selectedCouncilId].name;

    vote2015.website.loadCandidatesModal(selectedCouncilName);
  },

  closeModal: function() {
    $(".overlay").removeClass("active");
    $(".modal").removeClass("active");
    $(".close").removeClass("active");
    $("body").removeClass("no-scroll");
  },



  loadCandidatesModal: function(selectedCouncil) {
  	$(".candidates-modal .council-name").text(selectedCouncil);
    $(".close").addClass("active");
    $(".overlay").addClass("active");
    $(".candidates-modal").addClass("active");
    $(".modal h2")[0].scrollIntoView();
    $(".modal")[0].setAttribute('tabIndex', '0');
    setTimeout(function() {
      $(".modal")[0].focus();
    }, 300);


  },
};
