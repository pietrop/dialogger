define([
  'jquery',
  'serialize',
  'semantic',
  'transcript',
  'preview',
  'collections/assets',
  'collections/edits'
], function($, Serialize, Semantic, Transcript, Preview, AssetsCollection, EditsCollection)
{
  var initialize = function() {
    var leftSidebar = $('.left.sidebar')
    .sidebar({
        exclusive: false,
        transition: 'overlay',
        dimPage: false
    })
    .sidebar('attach events', '#leftButton')
    .sidebar('attach events', '#uploadButton', 'show');

    var rightSidebar = $('.right.sidebar')
    .sidebar({
        exclusive: false,
        transition: 'overlay',
        dimPage: false
    })
    .sidebar('attach events', '#rightButton')
    .sidebar('attach events', '#saveButton', 'show');

    var bottomSidebar = $('.bottom.sidebar')
    .sidebar({
        exclusive: false,
        closable: false,
        dimPage: false,
        onVisible: function() {
          $('.pusher').addClass('preview');
        },
        onHide: function() {
          $('.pusher').removeClass('preview');
        }
    })
    .sidebar('attach events', '#previewButton');

    $('.ui.dropdown').dropdown();

    $('#playButton').click(function() {
      if ($('#playButton i:first').hasClass('play')) {
        Transcript.play();
        $('#playButton i:first').removeClass('play').addClass('pause');
      } else {
        Transcript.pause();
        $('#playButton i:first').removeClass('pause').addClass('play');
      }
    });
    $('#stopButton').click(function() {
      Transcript.stop();
      $('#playButton i:first').removeClass('pause').addClass('play');
    });
    $('#boldButton').click(function() {
      Transcript.bold();
    });
    $('#italicButton').click(function() {
      Transcript.italic();
    });
    $('#saveButton').click(function() {
      Transcript.save();
    });

    $('#exportSubmit').click(function() {
      $('#exportForm .submit').click();
    });

    // test for success variable in JSON response
    $.fn.api.settings.successTest = function(response) {
      if(response && response.success) {
        return response.success;
      }
      return false;
    };

    // configure API endpoint
    $.fn.api.settings.api = {
      'export': '/api/edits/export/{id}'
    };

    // configure form validation
    $('#exportForm')
    .form({
      fields: {
        name: 'empty'
      }
    })
    // configure form submission
    .api({
      action: 'export',
      method: 'POST',
      serializeForm: true,
      beforeSend: function(settings) {
        console.log(settings);
        if (settings.data.ffmpeg.vb) settings.data.ffmpeg.vb += 'k';
        if (settings.data.ffmpeg.ab) settings.data.ffmpeg.ab += 'k';
        return settings;
      },
      onSuccess: function(response) {
        $('#exportForm').form('reset');
        $('#exportModal').modal('hide');
        EditsCollection.set($('#exportForm').data('id'), 'jobid', response.jobid);
        EditsCollection.set($('#exportForm').data('id'), 'ready', false);
        var checker = setInterval(function() {
          $.ajax({
            url: '/api/edits/export/status/'+response.jobid,
            statusCode: {
              200: function() {
                clearInterval(checker);
                EditsCollection.set($('#exportForm').data('id'), 'ready', true);
              },
              500: function() {
                clearInterval(checker);
                alert('An error occured with the export process.');
              }
            }
          });
        }, 5000);
      },
      onFailure: function(response) {
        alert('Error: '+response);
      }
    });

    setInterval(AssetsCollection.fetch, 5000);
  };
  return {
    initialize: initialize
  };
});
