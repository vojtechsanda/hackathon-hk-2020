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
        SQL_CALC_FOUND_ROWS
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
    $response = [];

    $sql_variables = "message.id,
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
    $sql_filters = '';
    $sql_order = '';
    $sql_limit = '';

    $sql_params = [];
    $sql_filter_array = [];

    if (isset($_GET['category'])) {
      $sql_params[':category'] = $_GET['category'];
      $sql_filter_array[] = "message.category_id = :category";
    }
    if (isset($_GET['region'])) {
      $sql_params[':region'] = $_GET['region'];
      $sql_filter_array[] = "message.region_id = :region";
    }
    if (isset($_GET['source'])) {
      $sql_params[':source'] = $_GET['source'];
      $sql_filter_array[] = "message.source_id = :source";
    }
    if (isset($_GET['txt'])) {
      $sql_params[':txt'] = $_GET['txt'];
      $sql_filter_array[] = "MATCH (message.title) AGAINST (:txt)";
    }

    if (count($sql_filter_array) > 0) {
      $sql_append = implode(' AND ', $sql_filter_array);
      $sql_filters = ' WHERE ' . $sql_append;
    }

    $orderby = $_GET['orderby'];
    $direction = $_GET['dir'];
    if (isset($orderby)) {
      $orderby = strtolower($orderby);
      if ($orderby == 'title' || $orderby == 'published_datetime') {
        $sql_order .= ' ORDER BY ' . $orderby;
        if (isset($direction)) {
          $direction = strtolower($direction);
          if ($direction == 'asc' || $direction == 'desc') {
            $sql_order .= ' ' . $direction;
          }
        }
      }
    }

    if (isset($_GET['limit'])) {
      $params[':limit'] = intval($_GET['limit']);
      $offset = $_GET['offset'];
      if (!isset($offset)) {
        $offset = 0;
      }
      $params[':offset'] = intval($offset);
      $sql_limit = ' LIMIT :limit OFFSET :offset';
    }

    $messages = $app->get('DB')->exec(
      'SELECT ' . $sql_variables . $sql_filters . $sql_order . $sql_limit, $sql_params
    );

    $message_count = $app->get('DB')->exec(
      'SELECT COUNT(*) FROM message ' . $sql_filters, $sql_params
    );

    if (count($message_count) > 0) {
      $response['count'] = $message_count[0]['COUNT(*)'];
    }

    foreach ($messages as $key=>$message) {
      $messages[$key]['instances'] = $app->GET('DB')->exec(
        "SELECT id, title, attachment_url, attachment_filename
        FROM instance
        WHERE message_id = :message_id",
        [':message_id' => $message['id']]
      );
    }

    $response['messages'] = $messages;

    header('Content-type: application/json');
    echo json_encode($response, JSON_NUMERIC_CHECK);;
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
