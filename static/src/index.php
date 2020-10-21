<?php

require_once '../vendor/autoload.php';

$app = Base::instance();

$app->set('DB', new DB\SQL(
    'mysql:host=localhost;port=3306;dbname=hackathon_hk_2020',
    'root',
    ''
));

$app->route(
  'GET /',
  function () {
    echo Template::instance()->render('templates/index.html');
  }
);

$app->route(
  'GET /api/all',
  function($app) {
    $results = $app->get('DB')->exec(
      "SELECT
        message.id,
        message.title,
        message.attachment_url,
        message.attachment_filename,
        UNIX_TIMESTAMP(message.published_datetime) as published_datetime,
        UNIX_TIMESTAMP(message.expired_datetime) as expired_datetime,
        source.name as source,
        domain.name as domain
       FROM message
       INNER JOIN source
       ON source.id = message.source_id
       INNER JOIN domain
       ON domain.id = message.domain_id"
    );

    header('Content-type: application/json');
    echo json_encode($results, JSON_NUMERIC_CHECK);
  }
);

$app->run();
