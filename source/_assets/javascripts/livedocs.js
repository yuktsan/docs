$(function () {
  $('.live-doc').each(function(){
    livedoc = $(this);
    form = $(this).find('form');
    form_table = $(this).find('form>table');

    //can't assume that a call requires params so this isn't gonna work
    params_table = $(this).prev('table');
    params_id = params_table.attr('id');
    
    identifier = params_id.substr(params_id.indexOf('-')+1, params_id.length);

    rows = params_table.find('tr').slice(1); //throw out the header row

    rows.each(function(){
      data = $(this).children('td');
      name = $(data[0]).text().trim();
      required = $(data[1]).text().trim();
      requirements = $(data[2]).text().trim();
      description = $(data[3]).text().trim();

      status_class = required == "true" ? "has-error" : "";
      input_class = required == "true" ? "required" : "";

      form_field = "<tr><td>" + name + "</td>";
      form_field += '<td><input type="text" class="input-sm ' + status_class + '" name="' + name + '"'
      if (required=="true") {
        form_field += ' placeholder="required"';
      }
      form_field += '/>';
      form_field += '</td>';
      form_field += "<td>" + requirements + "</td>";
      form_field += "<td>" + description + "</td>";
      form_field += "</tr>";

      form_table.append(form_field);
    });

    form.append('<button type="input" class="btn btn-primary form-control">Make Request</button>');
    form.append('<hr/>'); 
    button = '<div><button class="btn btn-success tryit" id="tryit-'+identifier+'"><span class="icon-apiworkshop_v2"></span> Try It</button>'
    button += '<button class="btn btn-danger cancel" id="cancel-'+identifier+'">Cancel</button></div>'
    params_table.after(livedoc);
    params_table.before(button);
  });

  $('.tryit').click(function(){ 
    id = $(this).attr('id');
    identifier = id.substr(id.indexOf('-')+1, id.length);
    $('#parameters-' + identifier).hide();
    $('#apiexample-' + identifier).hide();
    $('#livedoc-' + identifier).show();
    $(this).next('.cancel').show();
    $(this).hide();
  });

  $('.cancel').click(function(){ 
    id = $(this).attr('id');
    identifier = id.substr(id.indexOf('-')+1, id.length);
    $('#livedoc-' + identifier).hide();
    $('#parameters-' + identifier).show();
    $('#apiexample-' + identifier).show();
    $(this).prev('.tryit').show();
    $(this).hide();
  });

  $('.clear-request').click(function(){
    $(this).closest('.live-call').find('.body').text("");
    $(this).closest('.live-call').find('.response-body').addClass('hidden');
    $(this).closest('.live-call').find('.response-headers').addClass('hidden');
    $(this).closest('.live-call').find('.request-data').addClass('hidden');
    $(this).closest('.live-call').find('.data').text("");
    $(this).closest('.live-call').find('.headers').text("");
    $(this).closest('.live-call').find('.call').text("");
    $(this).closest('.live-call').find('.method').text("");

    $(this).closest('.live-call').hide();
  });

  $('.live-doc form').submit(function(e){
    e.preventDefault();

    //TODO validate that all required inputs have values

    //TODO check that the user has set username/password and json/xml response

    url = $(this).parent().find('.url').val();
    method = $(this).parent().find('.method').val().toUpperCase().trim();
    data = $(this).serialize().replace(/[^&]+=(?:&|$)/g, '').replace(/&$/, '');
    format = "json"; //TODO

    if (method=="GET") {
      call = url + "." + format + "?" + data
    } else {
      call = url + "." + format
    }

    live_call = $(this).nextAll('.live-call');
    live_call.find('.method').text(method);
    live_call.find('.call').text(call);

    if (method != "GET") {
      live_call.find('.request-data').removeClass("hidden");
      live_call.find('.data').text(data);
    }

    live_call.show();

    //TODO show a loading indicator 

    $.ajax({
      type: method,
      url: url,
      data: data
    })
    .done(function(response, statusText, jqXHR) {
      live_call.find('.body').text(response);
      live_call.find('.response-body').removeClass('hidden');

      live_call.find('.headers').text(jqXHR.getAllResponseHeaders());
      live_call.find('.response-headers').removeClass('hidden');
    })
    .fail(function(response, statusText, error) {
      live_call.find('.body').text(statusText);
      live_call.find('.response-body').removeClass('hidden');
    });
  });
});
