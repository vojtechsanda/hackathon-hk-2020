<?php

require_once '../../vendor/autoload.php';

$app = Base::instance();

// Setup DB
$app->set('DB', new DB\SQL(
    'mysql:host=localhost;port=3306;dbname=hackathon_hk_2020',
    'root',
    ''
));

// Static index route
$app->route(
    'GET /',
    function () {
        echo Template::instance()->render('templates/index.html');
    }
);

// Route for message detail
$app->route(
    'GET /api/message',
    function ($app) {
        if (!isset($_GET['id'])) {
            $app->error(404);
            exit;
        }

        $results = $app->get('DB')->exec(
            "SELECT message.title,
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
            ON category.id = message.category_id
            WHERE message.id = :message_id",
            [':message_id' => $_GET['id']]);

        if (count($results) == 0) {
            $app->error(404);
            exit;
        }

        $result = $results[0];

        $result['instances'] = $app->GET('DB')->exec(
            "SELECT id, title, attachment_url, attachment_filename
            FROM instance
            WHERE message_id = :message_id",
            [':message_id' => $_GET['id']]
        );

        header('Content-type: application/json');
        echo json_encode($result, JSON_NUMERIC_CHECK);
    }
);

// Route for all messages
$app->route(
    'GET /api/search',
    function ($app) {
        $response = [];

        $sql_variables =
            "message.id,
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

        $message_count = $app->get('DB')->exec(
            'SELECT COUNT(*) FROM message ' . $sql_filters, $sql_params
        );

        if (isset($_GET['limit'])) {
            $sql_params[':limit'] = intval($_GET['limit']);
            $offset = $_GET['offset'];
            if (!isset($offset)) {
                $offset = 0;
            }
            $sql_params[':offset'] = intval($offset);
            $sql_limit = ' LIMIT :limit OFFSET :offset';
        }

        $messages = $app->get('DB')->exec(
            'SELECT ' . $sql_variables . $sql_filters . $sql_order . $sql_limit, $sql_params
        );

        if (count($message_count) > 0) {
            $response['count'] = $message_count[0]['COUNT(*)'];
        }

        $response['messages'] = $messages;

        header('Content-type: application/json');
        echo json_encode($response, JSON_NUMERIC_CHECK);;
    }
);

// Route to get sources from region
$app->route(
    'GET /api/sources',
    function ($app) {
        $sql = "SELECT source.id, source.name, COUNT(message.id) as count
                FROM source
                LEFT JOIN message
                ON message.source_id = source.id";

        $params = [];
        if (isset($_GET['region'])) {
            $params[':region'] = $_GET['region'];
            $sql .= " WHERE source.region_id = :region";
        }

        $sql .= " GROUP BY source.id";

        $results = $app->get('DB')->exec(
            $sql, $params
        );
        header('Content-type: application/json');
        echo json_encode($results, JSON_NUMERIC_CHECK);
    }
);

// Route to get categories from region
$app->route(
    'GET /api/categories',
    function ($app) {
        $sql = "SELECT
                    category.id,
                    category.name,
                    COUNT(message.id) as count
                FROM category
                LEFT JOIN message
                ON message.category_id = category.id";

        $params = [];
        if (isset($_GET['region'])) {
            $params[':region'] = $_GET['region'];
            $sql .= " WHERE category.region_id = :region";
        }

        $sql .= " GROUP BY category.id";

        $results = $app->get('DB')->exec($sql, $params);
        header('Content-type: application/json');
        echo json_encode($results, JSON_NUMERIC_CHECK);
    }
);

// Get all regions
$app->route(
    'GET /api/regions',
    function ($app) {
        $results = $app->get('DB')->exec("SELECT * FROM region");

        header('Content-type: application/json');
        echo json_encode($results, JSON_NUMERIC_CHECK);
    }
);

// Apply routes
$app->run();
