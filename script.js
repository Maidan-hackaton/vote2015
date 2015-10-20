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
  fetch("data/city_counsils.json").then(function(response) {
    return response.json();
  }).then(function(councils) {
    vote2015.cityCouncils = {};
    vote2015.regions = [];
    vote2015.cityCouncilsByRegion = {};
    councils.forEach(function(council) {
      var name = getFullCouncilName(council.region, council.name);
      var id = getCouncilId(council.region, council.name);
      vote2015.cityCouncils[id] = council;
      vote2015.regions.push(council.region);
      if (!vote2015.cityCouncilsByRegion.hasOwnProperty(council.region)) {
        vote2015.cityCouncilsByRegion[council.region] = [];
      }
      vote2015.cityCouncilsByRegion[council.region].push(council);
    });
    vote2015.regions = $.unique(vote2015.regions);
    vote2015.regions = vote2015.regions.sort(function(a, b) {
      return a.localeCompare(b);
    });
    vote2015.regions.forEach(function(region) {
      $("#region1").append("<option value='" + region + "'>" + region + "</option>");
    });
    Object.keys(vote2015.cityCouncilsByRegion).forEach(function(regionKey) {
      vote2015.cityCouncilsByRegion[regionKey] = vote2015.cityCouncilsByRegion[regionKey].sort(function(a, b) {
        return a.name.localeCompare(b.name);
      });
    })

  }).catch(function(error) {
    console.log(error);
  });
  $("#region1").change(function() {
    var selectedRegion = $("#region1").val();
    $("#region").empty();
    $("#region").append("<option value='' disabled selected>Міська рада/громада</option>");
    var councils = vote2015.cityCouncilsByRegion[selectedRegion];
    councils.forEach(function(council) {
      var id = getCouncilId(council.region, council.name);
      var name = council.name;
      $("#region").append("<option value='" + id + "'>" + name + "</option>");
    });
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
          "<div class='checkbox'><i class='fa'></i></div><li class='candidate'>" +
          "<span class='name'>" + candidate.full_name + "</span>" +
          "<span class='party'>" + candidate.party + "</span>"
          + "</li>");
      });
      setTimeout(function() {
          vote2015.website.bindVote();
      }, 300);
    });
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

  bindVote: function() {
    var vote = function(e) {
      e.preventDefault();
      vote2015.website.vote($(this));
    };
    $("#mayorCandidates .checkbox").bind("click", vote);
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

  vote: function(el) {
    $("#mayorCandidates .checkbox i").removeClass("fa-check");
    el.find("i").addClass("fa-check");
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
