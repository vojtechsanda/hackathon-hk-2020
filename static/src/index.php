<?php

require_once '../../vendor/autoload.php';

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
    $messages = $app->get('DB')->exec(
      "SELECT
        message.id,
        message.title,
        message.source_id,
        message.category_id,
        message.body,
        1000 * UNIX_TIMESTAMP(message.published_datetime) as published_datetime,
        1000 * UNIX_TIMESTAMP(message.expired_datetime) as expired_datetime,
        DATE_FORMAT(message.published_datetime, '%e.%c.%Y') as published_datetime_txt,
        DATE_FORMAT(message.expired_datetime, '%e.%c.%Y') as expired_datetime_txt,
        source.name as source,
        category.name as category
       FROM message
       INNER JOIN source
       ON source.id = message.source_id
       INNER JOIN category
       ON category.id = message.category_id"
    );

    foreach ($messages as $key=>$message) {
      $messages[$key]['instances'] = $app->GET('DB')->exec(
        "SELECT id, title, attachment_url, attachment_filename
        FROM instance
        WHERE message_id = :message_id",
        [':message_id' => $message['id']]
      );
    }

    header('Content-type: application/json');
    echo json_encode($messages, JSON_NUMERIC_CHECK);
  }
);

$app->route(
  'GET /api/search',
  function($app) {
    $sql = "SELECT
            message.id,
            message.title,
            message.source_id,
            message.category_id,
            message.body,
            1000 * UNIX_TIMESTAMP(message.published_datetime) as published_datetime,
            1000 * UNIX_TIMESTAMP(message.expired_datetime) as expired_datetime,
            DATE_FORMAT(message.published_datetime, '%e.%c.%Y') as published_datetime_txt,
            DATE_FORMAT(message.expired_datetime, '%e.%c.%Y') as expired_datetime_txt,
            source.name as source,
            category.name as category
            FROM message
            LEFT JOIN source
            ON source.id = message.source_id
            LEFT JOIN category
            ON category.id = message.category_id";

    $params = [];
    $sqls = [];

    if (isset($_GET['category'])) {
      $params[':category'] = $_GET['category'];
      $sqls[] = "message.category_id = :category";
    }
    if (isset($_GET['region'])) {
      $params[':region'] = $_GET['region'];
      $sqls[] = "message.region_id = :region";
    }
    if (isset($_GET['source'])) {
      $params[':source'] = $_GET['source'];
      $sqls[] = "message.source_id = :source";
    }
    if (isset($_GET['txt'])) {
      $params[':txt'] = $_GET['txt'];
      $sqls[] = "MATCH (message.title) AGAINST (:txt IN NATURAL LANGUAGE MODE)";
    }

    if (count($sqls) > 0) {
      $sql_append = implode(' AND ', $sqls);
      $sql .= ' WHERE ' . $sql_append;
    }

    echo $sql;
    print_r($params);

    $messages = $app->get('DB')->exec(
      $sql, $params
    );

    foreach ($messages as $key=>$message) {
      $messages[$key]['instances'] = $app->GET('DB')->exec(
        "SELECT id, title, attachment_url, attachment_filename
        FROM instance
        WHERE message_id = :message_id",
        [':message_id' => $message['id']]
      );
    }

    header('Content-type: application/json');
    echo json_encode($messages, JSON_NUMERIC_CHECK);;
  }
);

$app->route(
  'GET /api/sources',
  function($app) {
    $results = $app->get('DB')->exec(
      "SELECT * FROM source"
    );
    header('Content-type: application/json');
    echo json_encode($results, JSON_NUMERIC_CHECK);
  }
);

$app->route(
  'GET /api/categories',
  function($app) {
    $results = $app->get('DB')->exec(
      "SELECT * FROM category"
    );
    header('Content-type: application/json');
    echo json_encode($results, JSON_NUMERIC_CHECK);
  }
);

$app->route(
  'GET /api/regions',
  function($app) {
    $results = $app->get('DB')->exec(
      "SELECT * FROM region"
    );
    header('Content-type: application/json');
    echo json_encode($results, JSON_NUMERIC_CHECK);
  }
);

$app->run();
