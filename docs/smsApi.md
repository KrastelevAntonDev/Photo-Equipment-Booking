Create by pdf2md 
могут быть незначительные отличия от оригинала.
или ошибки в распознавании.

# Page 1/30

# Отправка сообщения

URL: https://admin.p1sms.ru/apiSms/create Метод post

|  Имя | Тип | Значение | Обжалельный | Примечание  |
| --- | --- | --- | --- | --- |
|  aplikay | string | API-ключ | Да | API-ключ вы можете найти в разделе «С Эмулятодватросов»Скем «С Инструкция» API»C  |
|  webhookUrl | string | webhook URL | Нет | URL для отправки изменений статуса  |
|  sms | array | Список сообщений | Да | Максимальное количество СМС в одном запросе - 1000  |
|  sms *.phone | string(11) | Номер телефона | Да |   |
|  sms *.text | string | Текст сообщений | Нет |   |
|  sms *.link | string | Ссылка для подстановки | Нет | В случае если в тексте нет переменной #shorturl#, параметр будет проектирующим  |
|  sms *.linkTri | integer | Срок жизни сокращенной ссылки (в минутах) | Нет |   |
|  sms *.channel | string | Канал сообщений (digit, char, vibe, vk, whatsapp, ww, zip, telegram, auth) | Да |   |
|  sms *.sender | string | Имя отправителя | Да, если канал сообщений char, vibe, whatsapp, ww, zip |   |
|  sms *.plannedAt | timestamp | Количество секунд (для timestamp) | Нет |   |
|  sms *.viberParameters * | array | Параметры сообщений Viber | Да, если канал сообщений viber | Изображение, кнопка в сообщений, параметры каскадной рассылки  |
|  sms *.viberParameters * | type | Тип сообщения Viber | Да | Текст сообщения без кнопки
Тип - сообщения с кнопкой, открывающей ссылку
[Илея - сообщение с кнопкой с номером телефона  |
|  sms *.viberParameters * | ttmText | Array | Текст кнопки | Да, если type равен link, phone  |
|  sms *.viberParameters * | ttmLink | string | Ссылка кнопки | Да, если type равен link  |
|  sms *.viberParameters * | ttmPhone | string(11) | Номер кнопки | Да, если type равен phone  |
|  sms *.viberParameters * | imageHash | string | Хец-картинки | Да, если type равен link, phone  |
|  sms *.viberParameters * | areaLifetime | Integer | Время жизни сообщений | Нет  |
|  sms *.vkParameters * | array | Параметры сообщений BitLecture | Да, если канал сообщений vk |   |
|  sms *.vkParameters * | templateId | Integer | Идентификатор шаблона | Да  |
|  sms *.vkParameters * | tmspData | 200N | Значение переменных шаблона | Да  |
|  sms *.vkParameters * | userId | Integer | Идентификатор пользователя, которому нужно доставить уведомление | Нет  |
|  sms *.vkParameters * | pushToken | string | Хец-картинки | Нет  |
|  sms *.vkParameters * | pushApp | string | OS-поив арх | Нет  |
|  sms *.vkParameters * | pushEncrypt | Integer (0 1) | Указывает, шифровать ли сообщения для приложения | Нет  |
|  sms *.vkParameters * | userId | string | 0 8.0.0) | 0* адрес пользователя  |
|  sms *.vkParameters * | ttl | Integer | Время жизни сообщений в секундах (от 60 до 66400 секунд) | Нет  |
|  sms *.vkParameters * | issueTime | timestamp | Время создания сообщений в (ВИТ+0 Примен., изоблие) в формате десятичного числа в секундах с 1 января 1970 года | Нет  |
|  sms *.header.test | string | Заголовок WhatsApp сообщений | Да, если канал сообщений whatsapp и в шаблоне указавзаголовок |   |
|  sms *.waParameters | object | Параметры сообщений Whatsapp | Да, если канал сообщений whatsapp | Название шаблона, язык шаблона  |
|  sms *.waParameters | template | string | Название WhatsApp шаблона | Да, если канал сообщений whatsapp  |
|  sms *.waParameters | language | string (1c 1 sec ) | Язык WhatsApp шаблона | Да, если канал сообщений whatsapp  |
|  sms *.cascadeSchemeld | integer |  | 0) схемы каскадных сsec | Нет  |
|  sms *.tag | string(20) | Название тara | Нет | Тиг для сортировки среди всех сообщений  |
|  sms *.randomizer | integer (0 1) | Включение рандомизации сообщений | Нет | Значения 0 или 1. По умолчанию + 0. Только для каналов: digit, char, ww, zip
Рандомизатор способен распознать три вида скобок:
(1) - одно из значений*
(1) - слова внутри будут подставлены в разных вариантах**
(1) - слова внутри, является необязательным, и будет предложено несколько вариантов с его отображением***  |
|   |  |  |  | Комбинировать скобки можно, например:
[Сдам (свою завартиру [за 19:20 (тысстыс д (тыс р)]
[Сдам (свою завартиру (студенс [за 15:20 (тысстыс д (тыс р)
[Сдам (свою завартиру (студенс (без ремонта)] [за 15:20 (тыс)
[Сдам (свою) (с ремонтом)] (мужчина (женщина).]  |
|   |  |  |  | НО нельзя комбинировать одни и те же скобки, например:
[Сдам (свою) (0 - полу ремонтом с ремонтом] (вид какой-нибудь вариант) только (мужчина (женщина):
0.1, 0.2 (0) может быть более 20 разделителей (словсёртрое слово)  |

---

# Page 2/30

| Фак | Тип | Значение | Обжательные | Примечание |
| :-- | :-- | :-- | :-- | :-- |
| sms \ randomizerOptions | array | Дополнительные параметры для <br> рандомязатора | Нет |  |
| sms \ randomizerOptions.translate | integer (0 <br> 1) | Величина, замену символов на похожие из <br> другого языка | Нет | Значение 0 или 1. По умолчанию = 0. |
| sms \ randomizerOptions locked | array | Список слов для заморозки | Нет | Слова из данного списка останутся без изменений при <br> включенной опции замены символов из другого языка. |
| sms \ randomizerOptions locked * | string | Слово для заморозки | Нет |  |

# Пример на РНР 

## Цифровой канал

$<$ ?php
\$curl = curl_init();
curl_setupt_array(\$cur), array(
CURLOPT_URL == https://admin.p1sms.ru/apiSms/create',
CURLOPT_RETURNTRANSFER == true,
CURLOPT_ENCODING == \},
CURLOPT_MAXREDIRS == 10,
CURLOPT_TIMEOUT == 0,
CURLOPT_FOLLOWLOCATION == true,
CURLOPT_HTTP_VERSION == CURL_HTTP_VERSION_1_1,
CURLOPT_CUSTOMREQUEST == 'POST',
CURLOPT_POSTFIELDS == \}
"apiKey": "AbCd*******",
"sms": \}
\{
"channel": "digit",
"text": "text1",
"phone": "79**********",
"plannedAt": 1490612400
\}
\}
"channel": "digit",
"text": "text2",
"phone": "79**********",
"plannedAt": 1490612400
\}
\}
CURLOPT_HTTPHEADER == array(
'Content-Type: application/json'
), 0 ;
\$response = curl_exec(\$cur);
curl_close(\$cur);
echo \$response;

## Букаенный канал

$<$ ?php
\$curl = curl_init();
curl_setupt_array(\$cur), array(
CURLOPT_URL == https://admin.p1sms.ru/apiSms/create',
CURLOPT_RETURNTRANSFER == true,
CURLOPT_ENCODING == \},
CURLOPT_MAXREDIRS == 10,
CURLOPT_TIMEOUT == 0,
CURLOPT_FOLLOWLOCATION == true,
CURLOPT_HTTP_VERSION == CURL_HTTP_VERSION_1_1,
CURLOPT_CUSTOMREQUEST == 'POST',
CURLOPT_POSTFIELDS == \}
"apiKey": "AbCd*******",
"sms": \}
\{
"channel": "char",
"sender": "VIRTA",
"text": "text1",
"phone": "79**********",
"plannedAt": 1490612400
\}
\}
"channel": "char",
"text": "text2",
"phone": "79**********",
"plannedAt": 1490612400
\}
\}
CURLOPT_HTTPHEADER == array(
'Content-Type: application/json'
), 0 ;
\$response = curl_exec(\$cur);
curl_close(\$cur);
echo \$response;

---

# Page 3/30

# Viber 

```
<?php
$curl = curl_init();
curl_setup_array($curl, array(
CURLDPT_URL == 'https://admin.p1sms.ru/apiSms/create',
CURLDPT_RETURNTRANSFER => true,
CURLDPT_ENCODING => ',
CURLDPT_MAXREDIRS => 10,
CURLDPT_TIMEOUT => 0,
CURLDPT_FOLLOWLOCATION => true,
CURLDPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
CURLDPT_CUSTOMREQUEST => 'POST',
CURLDPT_POSTFIELDS =>{
    "apiKey": "AbCd****",
    "sms": {
        "channel": "viber",
        "sender": "TEST",
        "text": "TEST",
        "phone": "79********",
        "plannedAt": 1510000000,
        "viberParameters": {
            "type": "link",
            "btnLink": "https://link.example.com",
            "btnText": "clickme",
            "imageHash": "15a27ef2c31999.jpg"
        }
    }
}
"webhookUrl": "https://yoursite.com/viberUpdateStatusWebhook"
}
CURLDPT_HTTPHEADER => array(
    "Content-Type: application/json"
    }
    );
Sresponse = curl_exec($curl);
curl_close($curl);
echo $response;
```


## Вконтакте

```
<?php
$curl = curl_init();
curl_setup_array($curl, array(
CURLDPT_URL == 'https://admin.p1sms.ru/apiSms/create',
CURLDPT_RETURNTRANSFER => true,
CURLDPT_ENCODING => ",
CURLDPT_MAXREDIRS => 10,
CURLDPT_TIMEOUT => 0,
CURLDPT_FOLLOWLOCATION => true,
CURLDPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
CURLDPT_CUSTOMREQUEST => 'POST',
CURLDPT_POSTFIELDS => json_encode(array(
    'apiKey' => "AbCd****",
    'sms' => array(
        array(
            'channel' => 'vk',
            'phone' => '79********",
            'plannedAt' => 1510000000,
            'vkParameters' => array(
                'templateId' => 1,
                'tmpl_data' => '{"servicename":"yourorganization", "management":"nameofyourmanager"}'
            ),
        );
    'webhookUrl' => 'https://yoursite.com/vkUpdateStatusWebhook',
    );
CURLDPT_HTTPHEADER => array(
    "Content-Type: application/json"
    }
    );
Sresponse = curl_exec($curl);
curl_close($curl);
echo $response;

## WhatsApp

```
<?php
$curl = curl_init();
curl_setup_array($curl, array(
CURLDPT_URL == 'https://admin.p1sms.ru/apiSms/create',
CURLDPT_RETURNTRANSFER => true,
CURLDPT_ENCODING => ",
CURLDPT_MAXREDIRS => 10,
CURLDPT_TIMEOUT => 0,
CURLDPT_FOLLOWLOCATION => true,
CURLDPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
CURLDPT_CUSTOMREQUEST => 'POST',
CURLDPT_POSTFIELDS => json_encode(array(
```

---

# Page 4/30

```
WhatsApp
    'apiKey' => 'AbCd****',
    'sms' => array(
        array(
            'channel' => 'whatsapp',
            'sender' => 'WA',
            'header' => array(
            'text' => '3ar:onoeow'
        ),
        'waParameters' => array(
            'template' => 'test_template_with_variables',
            'language' => 'ru'
        ),
    )),
    1),
    CURLOPT_HTTPHEADER => array(
    'Content-Type: application/json'
),
));
Sresponse = curl_exec($curl);
curl_close($curl);
echo $response;
```


# Каскад 

<?php
$curl = curl_init();
curl_setup1_array($curl, array(
CURLOPT_URL => 'https://admin.p1sms.ru/apiSms/create',
CURLOPT_RETURNTRANSFER => true,
CURLOPT_ENCODING => ',
CURLOPT_MAXREDIRS => 10,
CURLOPT_TIMEOUT => 0,
CURLOPT_FOLLOWLOCATION => true,
CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
CURLOPT_CUSTOMREQUEST => 'POST',
CURLOPT_POSTFIELDS => \{
"apiKey": "AbCd****",
"sms": \{
"channel": "viber",
"phone": "79********",
"sender": "VIRTA",
"text": "text viber message 2",
"viberParameters": \{
"type": "text",
"smsLifetime": 60000
\},
"cascade": \{
"name": "API CASCADE TEST",
"schemeDetail": \{
"needStatus": "not_delivered",
"channel": "char",
"sender": "VIRTA",
"smotemplate": \{
"tests": \{
"text": "test cascade message 2"
\}
\}
\}
\}
\}
\}
CURLOPT_HTTPHEADER => array(
'Content-Type: application/json'
), 10
\$
\$response = curl_exec($curl);
curl_close($curl);
echo \$response;

## Telegram

<?php
$curl = curl_init();
curl_setup1_array($curl, array(
CURLOPT_URL => 'https://admin.p1sms.ru/apiSms/create',
CURLOPT_RETURNTRANSFER => true,
CURLOPT_ENCODING => ",
CURLOPT_MAXREDIRS => 10,
CURLOPT_TIMEOUT => 0,
CURLOPT_FOLLOWLOCATION => true,
CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
CURLOPT_CUSTOMREQUEST => 'POST',
CURLOPT_POSTFIELDS => json_encode(array(

---

# Page 5/30

# Telegram 

```
    'apiKey' => "AbCd****",
    'sms' => array(
    array(
        'channel' => 'telegram_autf',
        'phone' => '79********",
        'plannedAt' => 1510000000,
    1).
    1).
    CURLOPT_HTTPHEADER => array(
        Content-Type: application/json'
    1).
    1).
    \$response = curl_exec(\$curl);
    curl_close(\$curl);
    echo \$response;
```


## Пример на 1C

## Цифровой канал

Совдинение = Новый НТТРСовдинение['https://admin.p1sms.ru/apiSms/',,,,, Новый ЗащищенноеСовдинениеOpenSSL(); Запрос = Новый HTTPЗапрос['create'];
Запрос.Заголовки.Вставить("Content-Type", "application/json");
Запрос.Заголовки.Вставить("accept", "application/json");
Запрос.УстановитьТелоИзСтрока("["/apiKey": "\AbCd********",
"\Sms": \{
\{
"channel": "\8gjt",
"phone": "79********",
"text": "text1",
"plannedAt": 1490612400
\},
\{
"channel": "\8gjt",
"phone": "79********",
"text": "text2",
"plannedAt": 1490612400
\}
\},
"", "utf-8", ИспользованиеByteOrderMark.Нейспользовать);
Ответ = Соединение.ОтправитьДляОбработки(Запрос);
ТелоОтвет = Ответ.ПолучитьТелоКакСтроку();
Буквенный канал
Совдинение = Новый НТТРСовдинение['https://admin.p1sms.ru/apiSms/',,,,, Новый ЗащищенноеСовдинениеOpenSSL(); Запрос = Новый HTTPЗапрос['create'];
Запрос.Заголовки.Вставить("Content-Type", "application/json");
Запрос.Заголовки.Вставить("accept", "application/json");
Запрос.УстановитьТелоИзСтрока("["/apiKey": "\AbCd********",
"\Sms": \{
\{
"channel": "\char",
"phone": "79********",
"text": "text1",
"plannedAt": 1490612400,
"sender": "VIRTA"
\},
\{
"channel": "\char",
"phone": "79********",
"text": "text2",
"plannedAt": 1490612400,
"sender": "VIRTA"
\}
\},
"", "utf-8", ИспользованиеByteOrderMark.Нейспользовать);
Ответ = Соединение.ОтправитьДляОбработки(Запрос);
ТелоОтвет = Ответ.ПолучитьТелоКакСтроку();
Viber
Совдинение = Новый НТТРСовдинение['https://admin.p1sms.ru/apiSms/',,,,, Новый ЗащищенноеСовдинениеOpenSSL(); Запрос = Новый HTTPЗапрос['create'];
Запрос.Заголовки.Вставить("Content-Type", "application/json");
Запрос.Заголовки.Вставить("accept", "application/json");
Запрос.УстановитьТелоИзСтрока("["/apiKey": "\AbCd********",
"\Sms": \{
\{
"channel": "\viber",
"phone": "79********",
"text": "text1",
"plannedAt": 1510000000,
"sender": "TEST",
"viberParameters": \{
\{
"type": "link",
"btnLink": "https://link.example.com",

---

# Page 6/30

# Viber 

```
                    "btnText": "click.me",
                    "imageHash": "15a27ef2c31999.jpg"
                    }
                    "webhookUrl": "https://yoursite.com/viberUpdateStatusWebhook"
                    }
                    }
    },"utf-8",ИспользованиеByteOrderMark.HeИспользовать);
Ответ = Соединение.ОтправитьДляОбработки(Запрос);
ТелоОтвет = Ответ.ПолучитьТелоКакСтроку();
```


## Вконтакте

Совдинение = Новый HTTPСовдинение('https://admin.p1sms.ru/apiSms/__ Новый ЗащищенноеСовдинениеOpenSSL());
Запрос = Новый HTTPЗапрос("create");
Запрос.Заголовки.Вставить("Content-Type", "application/json");
Запрос.Заголовки.Вставить("accept", "application/json");
Запрос.УстановитьТелоИзСтроки("["apiKey": "AbCd********",
"sms":[
{
"channel": "vk",
"phone": "79**********",
"plannedAI": 1510000000,
"vkParameters": [
{
"templateId": 1,
"tmpI_data": "{"servicename":"yourorganization", "managemame":"nameofyourmanager"}"
},
"webhookUrl": "https://yoursite.com/vkUpdateStatusWebhook"
}
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
"utf-8", ИспользованиеByteOrderMark.HeИспользовать);
Ответ = Соединение.ОтправитьДляОбработки(Запрос);
ТелоОтвет = Ответ.ПолучитьТелоКакСтроку();
```


## Каскад

Совдинение = Новый HTTPСовдинение('https://admin.p1sms.ru/apiSms/__ Новый ЗащищенноеСовдинениеOpenSSL());
Запрос = Новый HTTPЗапрос("create");
Запрос.Заголовки.Вставить("Content-Type", "application/json");
Запрос.Заголовки.Вставить("accept", "application/json");
Запрос.УстановитьТелоИзСтроки("["apiKey": "AbCd********",
"sms":[
{
"channel": "whatsapp",
"sender": "WA",
"header": [
{
"text": "Заголовок"
},
"waParameters": [
{
"template": "test_template_with_variables",
"language": "ru"
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
},
}
}

## Каскад

Совдинение = Новый HTTPСовдинение('https://admin.p1sms.ru/apiSms/__ Новый ЗащищенноеСовдинениеOpenSSL());
Запрос = Новый HTTPЗапрос("create");
Запрос.Заголовки.Вставить("Content-Type", "application/json");
Запрос.Заголовки.Вставить("accept", "application/json");
Запрос.УстановитьТелоИзСтроки("["apiKey": "AbCd********",
"sms":[
{
"channel": "viber",
"phone": "79**********",
"sender": "VIRTA",
"text": "text viber message 2",
"viberParameters": [
"type": "text",
"smsLifetime": 60000
],
"cascade": [
"name": "API CASCADE TEST",
"schemeDetail": [
{
"needStatus":"not_delivered",
"channel":"char",
"sender":"VIRTA",
"smstemplate": [
"texts": [
{
"text": "test cascade message 2"
}
}
}
}
```

---

# Page 7/30

# Каскад 

## Telegram

Совдинение = Новый НТТРСовдинение( "https://admin.p1sms.ru/apiSms/" ,,,, Новый ЗащищенноеСовдинениеOpenSSL()); Запрос = Новый НТТРЗапрос("create"); Запрос.Заголовки.Вставить("Content-Type", "application/json"); Запрос.Заголовки.Вставить("accept", "application/json"); Запрос.УстановитьТелоИзСтроки("("apiKey"": ""AbCd********", "sms" " $\mid$ "channel"": ""uk"" phone"": ""Y\#********""", "plannedXl"": 1510000000, \} \}", "utf-8", ИспользованиеByteOrderMark.Нейспользовать); Ответ = Совдинение.ОтправитьДляОбработки(Запрос); ТелоОтвет = Ответ.ПолучитьТелоКакСтроку();

---

# Page 8/30

# Создание схемы каскадных сообщений 

## URL: https://admin.p1sms.ru/apiSms/createCascadeScheme Метод post

| Имя | Тип | Значение | Обоснованный | Примечание |
| :--: | :--: | :--: | :--: | :--: |
| арйзу | string | API-кноп | Да | API-кноп вы можете найти в разделе «С Эмулятсфалросов»! или «С Инструициею API»! |
| name | string | Название схемы каскада | Нет |  |
| comment | string | Комментарий | Нет |  |
| schemeDetail | array | Схема каскадных сообщений | Да |  |
| schemeDetail*.needStatus | string | Статус, при котором должно отправиться каскадное сообщение | Да | delivered - Доставлено, not_delivered - Не доставлено, error- <br> Ошибка отправка: med - Прочитано (Доступно только для каналов: кв, обак) |
| schemeDetail*.sender | string | Имя отправления | Да, если канал сообщений - «Ове, сfаг |  |
| schemeDetail*.channel | string | Канал сообщений (digit, char, «Ове, кв) | Да |  |
| schemeDetail*.minutesDelay | integer | Задержка отправки сообщения (в минутах) | Нет |  |
| schemeDetail*.sendStartTime | integer | Время, от которого можно отправить сообщения | Нет | Количество минут с начала дня по UTC, например, 10.00 по МСК < 420 минут с начала дня по UTC |
| schemeDetail*.sendEndTime | integer | Время, до которого можно отправить сообщения | Нет | Количество минут с начала дня по UTC, например, 10.00 по МСК < 420 минут с начала дня по UTC |
| schemeDetail*.smstemplate | array | Шаблон сообщения | Да |  |
| schemeDetail*.smstemplate*.tests | array | Тексты сообщений | Да |  |
| schemeDetail*.smstemplate*.tests*.test | string | Текст сообщения | Да |  |
| schemeDetail*.smstemplate*.tests*.link | string | Ссылка для подстановки | Нет | В случае если в тексте нет переменной #shorturl#, параметр будет проектироврован |
| schemeDetail*.smstemplate*.tests*.linkTtl | integer | Срок жизни сокращенной ссылки (в минутах) | Нет |  |
| schemeDetail*.smstemplate*.viberParameters | array | Параметры сообщений Viber | Да, если канал сообщений - «Ове | Изображение, кнопка в сообщений, параметры каскадной рассылки |
| schemeDetail*.smstemplate*.viberParameters*.type | string | Тип сообщения Viber | Да | 'test' - сообщение без кнопки/link' - сообщение с кнопкой, открывающей ссылку/phone' - сообщение с кнопкой с номером телефона |
| schemeDetail*.smstemplate*.viberParameters*.binText | string | Текст кнопки | Да, если type равен link, phone |  |
| schemeDetail*.smstemplate*.viberParameters*.binLink | string | Ссылка кнопки | Да, если type равен link |  |
| schemeDetail*.smstemplate*.viberParameters*.binPhone | string(11) | Номер кнопки | Да, если type равен phone |  |
| schemeDetail*.smstemplate*.viberParameters*.imageHash | string | Клы картинки | Нет | Возвращается в результате запроса на загрузку картинки |
| schemeDetail*.smstemplate*.rkParameters | array | Параметры сообщений ВКонтакте | Да, если канал сообщений - кв |  |
| schemeDetail*.smstemplate*.rkParameters*.templateId | integer | Идентификатор шаблона | Да | JSON объект, где ключи имена переменных в шаблоне |
| schemeDetail*.smstemplate*.rkParameters*.tmpData | JSON | Значение переменных шаблона | Да | JSON объект, где ключи имена переменных в шаблоне |
| schemeDetail*.smstemplate*.rkParameters*.usefd | integer | Идентификатор пользователя, которому нужно доставить уведомление | Нет | Предварительно передается в клиентскую библиотеку в установленном приложении |
| schemeDetail*.smstemplate*.rkParameters*.pushToken | string | Push token OS или Android | Нет | Получиется Ответу или средствами клиента с устройства |
| schemeDetail*.smstemplate*.rkParameters*.pushApp | string | iOS-поле арз | Нет | API( Dictionarz содержит ключ, используемый Apple для того, чтобы отправить уведомления на устройство |
| schemeDetail*.smstemplate*.rkParameters*.pushEncrypt | integer (0:1) | Нсосновят, цифровать ли сообщение для приложения | Нет | Значение 0 или 1. По умолчанию $+0$. |
| schemeDetail*.smstemplate*.rkParameters*.usefp | string <br> (0:0.0.0) | IP-адрес пользователя | Нет | Используется для определения подборов кодов (Dozeforce), а так же для ошитарования запросов; Если user, jp не будет указать, то соответствующие рейтинмиты использоваться не будут. |
| schemeDetail*.smstemplate*.rkParameters*.ttl | integer | Время жизни сообщения в секундах (от 60 до 85400 секунд) | Нет | По умолчанию сообщение живет вечно. Если сообщение не было доставлено за время ttl, оно не будет доставлено и тарифицированно |
| schemeDetail*.smstemplate*.rkParameters*.issueTime | timestamp | Время создания сообщения в (SMTH) <br> (Трама́нъ, unistime) в формате десятичного месяца в секундах с 1 января 1970 года | Нет | По умолчанию берется время выполнения запроса на отправку. Используется вместе с параметром для вычисления времени жизни сообщения. |
| schemeDetail*.schemeDetail | array | Схема каскадных сообщений | Нет |  |

## Пример на РНР

## Пример на РНР

$<$ ?php
\$curl = curl_init();
curl_setup1_array(\$curl, array)
CURLOPT_URL $=>$ https://admin.p1sms.ru/apiSms/createCascadeScheme'
CURLOPT_RETURNTRANSFER $=>$ true

---

# Page 9/30

```
Пример на PHP
CURLDPT_ENCODING == ",
CURLDPT_MAXREDIRS => 10,
CURLDPT_TIMEOUT => 0,
CURLDPT_FOLLOWLOCATION => true,
CURLDPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
CURLDPT_CUSTOMREQUEST => 'POST',
CURLDPT_POSTFIELDS == {
    'apiKey': 'ASCO**********',
    "cascade": {
        'name': 'Api_Cascadee_Template_1',
        'schemeDetail': [
            {
                'needStatus': 'delivered',
                'channel': 'digit',
                'minutesDelay': 60,
                'sendStartTime': 420,
                'sendEndTime': 1020,
                'smotemplate': {
                    'texts': [
                    {
                        'text': 'test #shorturl#',
                        'link': 'https://test.com',
                        'linkT0': 720
            }
            ]
            ] ;
            'schemeDetail': [
            {
                'needStatus': 'delivered',
                'channel': 'digit',
                'sendStartTime': 420,
                'sendEndTime': 960,
                'smotemplate': {
                    'texts': [
                    {
                        'text': 'test2'
                    }
                    }
                    }
                    }
                    }
                    }
                    'needStatus': 'not_delivered',
                    'channel': 'digit',
                    'smotemplate': {
                    'texts': [
                    {
                        'text': 'test'
                    }
                    }
                    }
                    }
    }
    CURLDPT_HTTPHEADER => array(
        'Content-Type: application/json'
    1
    10
    $response = curl_exec($curl);
    curl_close($curl);
    echo $response;
```

---

# Page 10/30

# Загрузка изображения для Viber 

URL: https://admin.p1sms.ru/apiSms/loadImage Метод post

| Имя | Тип | Значение | Обоззгельный | Примечание |
| :-- | :-- | :-- | :-- | :-- |
| арйму | string | API-клон | Да | API-клон вы можете найти в разделе «). Эмулятсфактрссовс) или «). Инструкцието API»» |
| img | file (.jpg, .png) | Файл с изображениям | Да |  |

## Пример на PHP

## Пример на PHP

```
<?php
    $url = https://admin.p1sms.ru/apiSms/loadImage';
    $requestArray = array(
        'aprKey' => 'AbCd****';
        'img' => new 'CURLFile(,'path_to_file/image.jpg'),
    );
    $curl = curl_init();
    curl_setupt($curl, CURLOPT_URL, $url);
    curl_setupt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setupt($curl, CURLOPT_POST, true);
    curl_setupt($curl, CURLOPT_POSTFIELDS, $requestArray);
    curl_setupt($curl, CURLOPT_HTTPHEADER, array(Content-Type: multipart/form-data', 'accept: multipart/form-data'));
    curl_setupt($curl, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
    $out = curl_exec($curl);
    $response = post_decode($out);
    curl_close($curl);
?>
```


## Пример ответа

Пример ответа
"status": "success",
"data": "61e6b3266f23c4.55220946.png"

---

# Page 11/30

# Отмена сообщений, которые находятся в статусе "На модерации" 

URL: https://admin.p1sms.ru/apiSms/reject Метод POST

| Имя | Тип | Значение | Обязательный | Примечание |
| :-- | :-- | :-- | :-- | :-- |
| apiKey | string | API-ключ | Да | API-ключ вы можете найти в разделе «С Экспетсраторссов»С или «С Инструкциито API»С |
| email | array |  | Да |  |
| email* | integer |  | Да |  |

## Пример на PHP

## Пример на PHP

```
<?php
$curl = curl_init();
curl_setup<array($curl, array(
    CURLOPT_URL => https://admin.p1sms.ru/apiSms/reject',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ZNCODING =>',
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => 'POST',
    CURLOPT_POSTFIELDS =>',
        'apiKey': 'ASCLI********',
        'email': [13580252]
    7,
    CURLOPT_HTTPHEADER => array(
        'Content-Type: application/json'
    1,
    3);
    $response = curl_exec($curl);
    curl_close($curl);
    echo $response;
```


## Пример ответа

Пример ответа
status": "success",
"data": {
"affected": 1,
"emold": 1
13580259
1
1

---

# Page 12/30

# Изменение времени отправки у сообщений в статусе "Запланировано" 

URL: https://admin.p1sms.ru/apiSms/changePlannedTime Метод POST

| Имя | Тип | Значение | Обязательный | Примечание |
| :-- | :-- | :-- | :-- | :-- |
| apiKey | string | API ключ | Да | API ключ вы можете найти в разделе <: Экспетсфактоссов</:изм <: Инструкциито API</ |
| smold | array |  | Да |  |
| smold * | integer |  | Да |  |
| plannedAt | integer | Количество секунд Unix timestamp | Да |  |

Пример на РНР

## Пример на РНР

```
<?php
$curl = curl_init();
curl_setup1_array($curl, array(
    CURLDPT_URL == https://admin.p1sms.ru/apiSms/changePlannedTime',
    CURLDPT_RETURNTRANSFER == true,
    CURLDPT_ENCODING == \{
    CURLDPT_MAXREDIRS == 10,
    CURLDPT_TIMEOUT == 0,
    CURLDPT_FOLLOWLOCATION == true,
    CURLDPT_HTTP_VERSION == CURL_HTTP_VERSION_1_1,
    CURLDPT_CUSTOMREQUEST == 'POST',
    CURLDPT_POSTFIELDS == \{
        \apiKey" 'ASCO******',
        "smold" [13580259],
        "plannedAt": "1717086527
    \}
    CURLDPT_HTTPHEADER == array(
        'Content-Type: application/json'
    \}
    \}
$response = curl_exec($curl);
```

curl_close(\$curl);
echo \$response;

## Пример ответа

## Пример ответа

\{
"status": "success",
"data": \{
"affected": 1,
"smold": \{
13580259
\}
\}

---

# Page 13/30

# Информация о сообщении 

URL: https://admin.p1sms.ru/apiSms/get Метод post

| Имя | Тел | Значение | Обозлельный | Примечание |
| :-- | :-- | :-- | :-- | :-- |
| apiKey | string | API-ключ | Да | API-ключ вы можете найти в разделе «). Эмулятсфакгроссан/і или «). Инструкциято API»» |
| apiSmsldList | array | Список ID сообщений | Да | Лимит в 1000 ID. |
| apiSmsldList * | integer | ID сообщения |  |  |

## Пример на PHP

## Пример на PHP

```
<?php
$curl = curl_init();
curl_setup1_array($cur1 array(
    CURLOPT_URL => 'https://admin.p1sms.ru/apiSms/get',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => ',
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUESST => 'POST',
    CURLOPT_POSTFRELES => \{
    "apiKey": "ASCIA********",
    "apiSmsldList": [
        77946466,
        77946467
    ]
\{
    CURLOPT_HTTPHEADER => array(
    'Content-Type: application/jsori
    ),
\});
\$response = curl_exec($cur1);
```

curl_close(\$cur1);
echo \$response;

## Пример на 1C

## Пример на 1C

Совдинение = Новый НТТРСовдинение("https://admin.p1sms.ru/apiSms/" $\qquad$ Новый ЗащищенноеСовдинениеOpenSSL(1);
Запрос = Новый HTTPЗапрос("get");
Запрос.Заголовки.Вставить("Content-Type", "application/jsori");
Запрос.Заголовки.Вставить("accept", "application/jsori");
Запрос.УстановитьТелоИЗ(Строка("["\$apiKey"", "\$ACIA********",
"apiSmsldList"": [1, 2, 3, 4, 5]);
"utf-8", ИспользованиеByteOrderMark.Нейспользовать);
Ответ = Соединение.ОтправитьДляОбработки(Запрос);
ТелоОтвет = Ответ.ПолучитьТелоКакСтроку();
Пример ответа

## Пример ответа

```
<status": "success",
    "data": [
        {
            "id": 77946466,
            "errorDescription": null,
            "cost": "0.50",
            "createdAt": 1504988172,
            "updatedAt": 1504988191,
            "cascadeSmsld": null,
            "status": "delivered",
        }
    }
    "id": 77946467,
        "errorDescription": null,
        "cost": "0.50",
        "createdAt": 1504988172,
```

---

# Page 14/30

# Пример ответа 

"updatedAt": 1504988191,
"cascadeSmsld": null,
"status": "not_delivered",

---

# Page 15/30

# Статус сообщения 

URL: https://admin.p1sms.ru/apiSms/getSmsStatus Метод get

| Имя | Тип | Значение | Обозательный | Примечание |
| :-- | :-- | :-- | :-- | :-- |
| apiKey | string | APIклен | Да | APIклен вы можете найти в разделе «С Эмулятсфалросов»Скле «С Инструациепо API»С |
| smsId | array | Список ID сообщений | Да |  |

## Статусы сообщений

| Название | Описание |
| :-- | :-- |
| "сжавид" | Создано |
| "moderation" | На модернции |
| "sent" | Отправлено |
| "error" | Ошибка в системе |
| "delivered" | Доставлено |
| "not_delivered" | Не доставлено |
| "read" | Прочитано |
| "planned" | Запланировано |
| "low_balance" | Низкий баланс клиента |
| "low_partner_balance" | Ошибка 592 |
| "rejected" | Отклонена |

## Пример на РНР

## Пример на PHP

## <?php

Scurl = curl_init();
curl_setup2_array(Scurl, array(
CURLOPT_URL == https://admin.p1sms.ru/apiSms/getSmsStatus?apiKey=AbCd******&smsId[0]=12854727&smsId[1]=12854728',
CURLOPT_RETURNTRANSFER == true,
CURLOPT_ENCODING == \,
CURLOPT_MAXREDRIS == 10,
CURLOPT_TIMEOUT == 0,
CURLOPT_FOLLOWLOCATION == true,
CURLOPT_HTTP_VERSION == CURL_HTTP_VERSION_1_1,
CURLOPT_CUSTOMREQUEST == 'GET',
2)
Sresponse = curl_exec(Scurl);
curl_close(Scurl);
echo Sresponse;

## Пример ответа

## Пример ответа

```
{
    "sms_id": 12854727,
    "sms_status": "not_delivered",
    "receive_date": "2022-11-23 08:51:57"
    }
    {
        "sms_id": 12854728,
        "sms_status": "sent",
        "receive_date": "2022-11-23 08:50:38"
    }
}

---

# Page 16/30

# Получение статусов смс с помощью Webhook 

## Получение списка отправленных сообщений

## URL: https://admin.p1sms.ru/apiSms/getSmsList Метод get

| Имя | Тип | Значение | Обязательный | Примечание |
| :--: | :--: | :--: | :--: | :--: |
| apWay | string | API-ключ | Да | API-ключ вы можете найти в разделе «l. Экспетсфактоссов»(или «). Инструкция» API-7. |
| page | integer | Номер страницы | Нет | Страница содержит 20 записей. Без указания номера страницы выводятся первые 20 записей. |
| pageCapacity | integer | Количество записей | Нет | Количество записей на странице. По умолчанию 20. Максимально допустимое 500 |
| search | string | Строка поиска | Нет | Строка поиска по номеру телефона |
| from | integer | Дата | Нет | Дата начала поиска в формате Timestamp, по умолчанию - начало текущего дня (00:00) |
| to | integer | Дата | Нет | Дата конца поиска в формате Timestamp, по умолчанию - конец текущего дня (23:59) |
| column | string | Поле для сортировки | Нет | Доступные поле (created_at, updated_at, sent_at) |
| order | string | Передок сортировки | Нет | (pec, desc) |
| sources | array |  | Нет |  |
| sources.* | string | Источник сообщений | Нет | Источники для фильтрации: (delivery, api, smpp, arnocrm, yclients, birthday) |
| channels | array |  | Нет |  |
| channels.* | string | Канал сообщений | Нет | Канал сообщений (digit, char, vibe; vk) |
| statuses | array |  | Нет |  |
| statuses.* | string | Статус сообщения | Нет | Доступные статусы для фильтрации: (created, delivered, not_delivered, low_balance, sent, error, read) |
| senders | array |  | Нет |  |
| senders.* | string | Имя отправления | Нет |  |
| messageType | string | Тип сообщения | Нет | Доступные типы: (service, promo) |
| shortUrlClicked | boolean | Переход по короткой ссылке | Нет |  |

## Пример на PHP

## Пример на PHP

```
<http
$curl = curl_init();
curl_setup1_array($curl, array)
    CURLOPT_URL == https://admin.p1sms.ru/apiUsers/getSmsList?apiKey=AbCd*******.
    CURLOPT_RETURNTRAINSFER == true,
    CURLOPT_ENCODING == ",
    CURLOPT_MAXREDIRIS == 10,
    CURLOPT_TIMEOUT == 0,
    CURLOPT_FOLLOWLOCATION == true,
    CURLOPT_HTTP_VERSION == CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST == 'GET',
    );
```

\$response = curl_exec(\$curl);
curl_close(\$curl);
echo \$response;

## Пример ответа

## Пример ответа

```
{
    "status": "success",
    "data": {
        }
        "smsId": 9345490,
        "createdAt": 1636458777,
        "updatedAt": 1636469578,
        "sentAt": null,
        "cost": "0.00000000",
        "phone": "79125933333",
        "status": "moderation",
        "sender": "VIRTA",

---

# Page 17/30

# Пример ответа 

"text": "text1"
1
10
"total": 39,
"currentPage": 1,
"perPage": 20

---

# Page 18/30

# Получение списка запланированных сообщений 

URL: https://admin.p1sms.ru/apiUsers/getPlannedSms Метод get

| Имя | Тип | Значение | Обездельный | Примечание |
| :-- | :-- | :-- | :-- | :-- |
| apiKey | string | API-ключ | Дa | API-ключ вы можете найти в разделе « Эмуляторвапросса»/ или «/ Инструкциято API»/ |
| page | integer | Номер страницы |  | Страница содержит 20 записей. Без указания номера страницы выводится первые 20 записей. |

## Пример на PHP

## Пример на PHP

```
<?php
$curl = curl_init();
curl_setup_array($curl, array(
    CURLOPT_URL == https://admin.p1sms.ru/apiUsers/getPlannedSms?apiKey=AbCd*******,
    CURLOPT_RETURNTRANSFER == true,
    CURLOPT_ENCODING == \,
    CURLOPT_MAXREDIRS == 10,
    CURLOPT_TIMEOUT == 0,
    CURLOPT_FOLLOWLOCATION == true,
    CURLOPT_HTTP_VERSION == CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST == 'GET',
    0;
$response = curl_exec($curl);
```

curl_close( $$ curl);
echo \$response;

## Пример ответа

## Пример ответа

```
{
    "status": "success",
    "data": [
        {
            "smsid": 12854732,
            "plannedAt": 1669352400,
            "cender": [
            "id": 275,
            "name": "VIRTA"
        },
        "phone": [
            "id": 393859,
            "phone": "79991234567",
            "additionalcolumns": null
        },
        "message": "ПрмаетI",
        "smsCount": 1,
        "deliveryName": "test1"
        }
    ]
}

---

# Page 19/30

# Просмотр статистики 

## URL: https://admin.p1sms.ru/api/v2/statistics Метод get

| Имя | Тип | Значение | Обозательный | Примечание |
| :--: | :--: | :--: | :--: | :--: |
| apiKey | string | API-клен | Да | API-клен вы можете найти в разделе «I. Эмулятсфалросов»О или «I. Инструкииияо API»1 |
| startDate | integer | Количество секунд Unix timestamp | Her |  |
| endDate | integer | Количество секунд Unix timestamp | Her |  |
| channels.* | string | 'digit', 'char', 'viber', 'voice' or 'vk' | Her |  |
| sources* | string | 'delivery', 'api', 'smpp' | Her |  |
| currencies.* | string |  | Her |  |
| exoCurrencies.* | string |  | Her |  |
| tags.* | string |  | Her |  |
| grouping.* | string | 'channel', 'delivery', 'operator', 'sender', 'smpp', 'source', 'tariff', 'tag' | Her |  |
| deliverptt | integer |  | Her | Ф.рассылки |

## Пример на РНР

## Пример на РНР

```
<?php
$curl = curl_init();
curl_setup<array($curl, array(
    CURLOPT_URL == %ttps://admin.p1sms.ru/api/v2/statistics?apiKey=AbCd******,
    CURLOPT_RETURNTRANSFER == true,
    CURLOPT_ENCODING == \
    CURLOPT_MAXREDRIS == 10,
    CURLOPT_TIMEOUT == 0,
    CURLOPT_FOLLOWLOCATION == true,
    CURLOPT_HTTP_VERSION == CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST == 'GET,
);
$response = curl_exec($curl);
curl_close($curl);
echo $response;
```


## Пример ответа

## Пример ответа

```
{
    "status": "success",
    "data": [
        {
            "currency": "RUB",
            "iCost": 50, // Стоимость клиента
            "iComp": 0, // Возврат клиенту
            "notDelivered": 0, // Количество недоставленных CMC
            "delivered": 10, // Количество доставленных CMC
            "read": 0, // Количество прочитанных CMC
            "sent": 0, // Количество отправленных CMC
            "totalSent": 10, // Всего отправленных CMC
            "clickedCount": 0, // Количество кликов в рассылке
            "cesCost": 0, // Стоимость допуспут клиента
            "esNotDelivered": 0, // Количество недоставленных доп. услуг
            "esDelivered": 0, // Количество доставленных доп. услуг
            "esRead": 0, // Количество просмотренных доп. услуг
            "esSent": 0, // Количество отправленных доп. услуг
            "esTotalSent": 0, // Всего отправлено доп. услуг
            "notSended": 0, // Количество неотправленных CMC
            "esNotSended": 0 // Количество неотправленных доп. услуг
        }
    }
}
```

---

# Page 20/30

# Добавление номера телефона в базу номеров 

URL: https://admin.p1sms.ru/apiPhoneBases/\{phone_base_id\}/phones Метод POST

| Имя | Тип | Значение | Обязательный | Примечание |
| :-- | :-- | :-- | :-- | :-- |
| арйзу | string | API-клеи | Да | API клеи вы можете найти в разделе « Эмуляторыпросов» или « Инструкциято API» |
| phones | array |  | Да |  |
| phones.* phone | string(11) | Номер телефона в международном формате | Да |  |
| phones.* additionalcolumns | array | Дополнительные столбцы | Нет |  |

## Пример на PHP

## Пример на PHP

```
<?php
$curl = curl_init();
curl_setup1_array($curl_array(
    CURLOPT_URL => https://admin.p1sms.ru/apiPhoneBases/7588/phones',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING =>',
    CURLOPT_MAWREDRIS => 10,
    CURLOPT_TIMEOUT => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => 'POST',
    CURLOPT_POSTFIELDS => \{
    'apifay': 'AbCd******',
    'phones': \{
        'phone': '79999996669'
    \}
\}
CURLOPT_HTTPHEADER => array(
    'Content-Type: application/json'
    \}
\}
$response = curl_exec($curl);
```

curl_close(\$curl);
echo \$response;

## Пример ответа

## Пример ответа

```
{
    'status': 'success',
    'data': {
        'duplicates': [],
        'added': [
            '79999996669'
        }
        'existing': []
    }
}
```

---

# Page 21/30

# Получение списка абонентов базы 

URL: https://admin.p1sms.ru/apiUsers/getBasePhones Метод get

| Имя | Тип | Значение | Обязательные | Примечание |
| :-- | :-- | :-- | :-- | :-- |
| apiKey | string | API-ключ | Да | API-ключ вы можете найти в разделе «I Эмуляторвапросовоі или «I Инструкцияпо API» |
| baseId | integer | ID базы | Да |  |
| column | string | Поле для сортировки | Нет | Доступные поле (created_at) |
| order | string | Порядок сортировки | Нет | (asc, desc) |
| page | integer | Номер страницы |  | Страница содержит 100 записей. Без указания номера страницы выводится первые 100 записей. |

## Пример на РНР

## Пример на РНР

```
<?php
$curl = curl_init();
curl_setup_array($curl, array(
    CURLDPT_URL == https://admin.p1sms.ru/apiUsers/getBasePhones?apiKey=AbCd******&baseId=7216&order=desc&column=created_at&page=1',
    CURLDPT_RETURNTRANSFER == true,
    CURLDPT_ENCODING == ",
    CURLDPT_MAXREDIRS == 10,
    CURLDPT_TIMEOUT == 0,
    CURLDPT_FOLLOWLOCATION == true,
    CURLDPT_HTTP_VERSION == CURL_HTTP_VERSION_1_1,
    CURLDPT_CUSTOMREQUEST == GET,
    );
    $response = curl_exec($curl);
    curl_close($curl);
    echo $response;
```


## Пример ответа

```
Пример ответа
{
    "status": "success",
    "data": 1,
        "total": 5,
        "perPage": 100,
        "currentPage": 1,
        "lastPage": 1,
        "nextPageUrl": null,
        "prevPageUrl": null,
        "from": 1,
        "to": 5,
        "data": [
            {
                "phone": "79655393477",
                "created_at": "2023-07-12 13:56:21"
            },
            {
                "phone": "79655393471",
                "created_at": "2023-07-12 13:56:21"
            },
            {
                "phone": "79655393475",
                "created_at": "2023-06-08 09:41:27"
            },
            {
                "phone": "79655393476",
                "created_at": "2023-06-07 10:04:13"
            },
            {
                "phone": "79194500011",
                "created_at": "2023-06-07 10:00:00"
            }
        }
    }
}
```

---

# Page 22/30

# Получение списка баз 

URL: https://admin.p1sms.ru/apiUsers/getUserBases Метод get

| Имя | Тип | Значение | Обязательный | Примечание |
| :-- | :-- | :-- | :-- | :-- |
| apiKey | string | API-ключ | Да | API-ключ вы можете найти в разделе «С Эмулятсфакпросов»Скем «С Инструкиия»С API»С |

## Пример на PHP

## Пример на PHP

$<$ ?php
\$curl = curl_init();
curl_extopt_array(\$curl, array(
CURLOPT_URL == ?dips://admin.p1sms.ru/apiUsers/getUserBases?apiKey=AbCd******)
CURLOPT_RETURNTRANSFER == true,
CURLOPT_ENCODING == \},
CURLOPT_MAXREDIRS == 10,
CURLOPT_TIMEOUT == 0,
CURLOPT_FOLLOWLOCATION == true,
CURLOPT_HTTP_VERSION == CURL_HTTP_VERSION_1_1,
CURLOPT_CUSTOMREQUEST == 'GET';
\};
\$response = curl_exec(\$curl);
curl_close(\$curl);
echo \$response;

## Пример ответа

## Пример ответа

[^0]
[^0]:    \{
    "status": "success",
    "data": \{
    "baseId": 4464,
    "baseName": "18.04.2019 (14:38:33)"

---

# Page 23/30

# Получение списка номеров из черного списка 

URL: https://admin.p1sms.ru/apiUsers/getUserBlacklist Метод get

| Имя | Тип | Значение | Обязательные | Примечание |
| :-- | :-- | :-- | :-- | :-- |
| арйзу | string | API-ключ | Дa | API-ключ вы можете найти в разделе « Эмуляторвапросов»/ или «/ Инструкциято API»/ |
| page | integer | Номер страницы |  | Страница содержит 100 записей. Без указания номера страницы выводятся первые 100 записей. |

## Пример на PHP

## Пример на PHP

```
<?php
$curl = curl_init();
curl_satopt_array($curl, array(
    CURLOPT_URL == https://admin.p1sms.ru/apiUsers/getUserBlacklist?apiKey=AbCd*******,
    CURLOPT_RETURNT&ANSFER == true,
    CURLOPT_ENCODING == ",
    CURLOPT_MAXREDIRS == 10,
    CURLOPT_TIMEOUT == 0,
    CURLOPT_FOLLOWLOCATION == true,
    CURLOPT_HTTP_VERSION == CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST == 'GET',
    );
$response = curl_exec($curl);
```

curl_close( $($ curl);
echo \$response;

## Пример ответа

## Пример ответа

```
{
    "status": "success",
    "data": {
        }
            "phone": "71231231211",
            "additionallnfo": null
    }
    }
```

---

# Page 24/30

# Проверка активности номера телефона 

URL: https://admin.p1sms.ru/apiSms/create Метод POST

| Имя | Тип | Значение | Обязательный | Примечание |
| :-- | :-- | :-- | :-- | :-- |
| apiKey | string | API-ключ | Да | API-ключ вы можете найти в разделе «/ Эмуляторзапросов»/ или «/ Инструкциято API»/ |
| webhookUrl | string | webhook URL | Нет | URL для отправки изменений статуса |
| sms | array | Список номеров на проверку | Да | Максимальное количество номеров в одном запросе - 1000 |
| sms.* phone | string(11) | Номер телефона | Да |  |
| sms.* channel | string | Какая сообщений (ping, hit) | Да |  |

## Пример на РНР

## Пример на РНР

```
<?php
$curl = curl_init();
curl_setup_array($curl, array(
    CURLOPT_URL => 'https://admin.p1sms.ru/apiSms/create',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => ",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUENT => 'POST',
    CURLOPT_POSTFIELDS =>',
    'apiKey': "AbCd*******",
    "sms": {
        }
        "channel": "hb",
        "phone": "79********",
        }
        }
        "channel": "ping",
        "phone": "79********",
        }
    }
    CURLOPT_HTTPHEADER => array(
        Content-Type: application/json
    ),
    );
    $response = curl_exec($curl);
    curl_close($curl);
    echo $response;
```


## Пример ответа

Пример ответа
status": "success",
"data": \{
"createdAt": 1688040288
"id": 510506708,
"status": "sent",
"phone": "79991002233"
\}
"id": 510506709,
"createdAt": 1698040289
"status": "sent",
"phone": "79991112234"

---

# Page 25/30

# Получение списка отправителей 

URL: https://admin.p1sms.ru/apiUsers/getUserSenders Метод get

| Имя | Тип | Значение | Обязательный | Примечание |
| :-- | :-- | :-- | :-- | :-- |
| xpiKey | string | API-ключ | Да | API-ключ вы можете найти в разделе «С Эмулятсфапросса»Скке «С Инструкиия»С API»С |

## Пример на PHP

## Пример на PHP

$<$ ?php
\$curl = curl_init();
curl_setup_array(\$curl, array(
CURLOPT_URL == ?dips://admin.p1sms.ru/apiUsers/getUserSenders?apiKey=AbCd*******,
CURLOPT_RETURNTRANSFER == true,
CURLOPT_ENCODING == \},
CURLOPT_MAXREDIRS == 10,
CURLOPT_TIMEOUT == 0,
CURLOPT_FOLLOWLOCATION == true,
CURLOPT_HTTP_VERSION == CURL_HTTP_VERSION_1_1,
CURLOPT_CUSTOMREQUEST == 'GET';
\};
\$response = curl_exec(\$curl);
curl_close(\$curl);
echo \$response;

## Пример ответа

## Пример ответа

```
{
    "status": "success",
    "data": {
        }
        "senderName": "SENDER",
        "status": null
    }
}
```

---

# Page 26/30

# Просмотр доступных шаблонов Вконтакте 

URL: https://admin.p1sms.ru/apiSms/listMessageTemplates Метод get

| Имя | Топ | Значение | Обнзательный | Примечание |
| :-- | :-- | :-- | :-- | :-- |
| арЖау | string | API-ключ | Да | API-ключ вы можете найти в разделе «С Эмулятсфакпросов»Скпе «С Инструкиияпо API»С |

## Пример на PHP

## Пример на PHP

$<$ ?php
\$curl = curl_init();
curl_setup_array(\$curl, array(
CURLOPT_URL == ?https://admin.p1sms.ru/apiSms/listMessageTemplates?apiKey=AbCd*****",
CURLOPT_RETURNTRANSFER == true,
CURLOPT_ENCODING == ",
CURLOPT_MAXREDIRS == 10,
CURLOPT_TIMEOUT == 0,
CURLOPT_FOLLOWLOCATION == true,
CURLOPT_HTTP_VERSION == CURL_HTTP_VERSION_1_1,
CURLOPT_CUSTOMREQUEST == 'GET',
$)$;
\$response = curl_exec(\$curl);
curl_close(\$curl);
echo \$response;

## Пример ответа

## Пример ответа

```
{
    "status": "success",
    "data": [
        }
        "id": 14,
        "name": "zvonobot_communicate_soon",
        "status": "available",
        "tmpI": "Our specialist will contact you shortly, #user#",
        "vkGroupUrl": "https://vk.com/zvonobot",
        "okGroupUrl": null,
        "attdir": null,
        "attachments": [],
    }
    }
}
```

---

# Page 27/30

# Просмотр доступных шаблонов каскадных сообщений 

URL: https://admin.p1sms.ru/apiSms/getCascadeSchemes Метод get

| Имя | Тип | Значение | Обязательный | Примечание |
| :-- | :-- | :-- | :-- | :-- |
| apiKey | string | API ключ | Да | API ключ вы можете найти в разделе «С Эмуляторыпросов»С или «С Инструкииято API»С |
| search | string | Строка помока | Нет |  |

## Пример на PHP

## Пример на PHP

$<$ ?php
\$curl = curl_init();
curl_setup_array(\$cur), array( $\square$
CURLOPT_URL == https://admin.p1sms.ru/apiSms/getCascadeSchemes?apiKey=AbCd***** ${ }^{*}$,
CURLOPT_RETURNTRANSFER $==$ true,
CURLOPT_ENCODING $==$ ",
CURLOPT_MAXREDIRS $=>10$,
CURLOPT_TIMEOUT $==0$,
CURLOPT_FOLLOWLOCATION $==$ true,
CURLOPT_HTTP_VERSION == CURL_HTTP_VERSION_1_1,
CURLOPT_CUSTOMREQUEST $=>$ 'GET',
$\square$
\$response = curl_exec(\$curl);
curl_close(\$cur);
echo \$response;

---

# Page 28/30

# Создание отправителя 

URL: https://admin.p1sms.ru/apiSenders/create Метод POST

| Имя | Тип | Значение | Областильный | Примечание |
| :--: | :--: | :--: | :--: | :--: |
| apiKey | string | API-кноп | Да | API-кноп вы можете найти в разделе «1 Экспрессраспроссан1кок «1 Инструкциепс API»1 |
| webhookUrl | string | webhook URL | Her | URL для отправки изменений статуса |
| type | string | Конап сообщений (cnet) | Да |  |
| name | string <br> (11) | Имя отправителя | Да |  |
| companyName | string |  | Да |  |
| link | string |  | Да |  |
| attachments, ${ }^{\text {a }}$ | file |  | Her | Допустимые ММЕТУРЕ: application/moword, application/vnd,openuniformate-officedocument.wordpress.orgmt,document, application/actetstream, application/pdf_image/png, image/png |

---

# Page 29/30

# Получение баланса 

URL: https://admin.p1sms.ru/apiUsers/getUserBalanceInfo Метод get

| Имя | Тип | Значение | Обновленный | Примечание |
| :-- | :-- | :-- | :-- | :-- |
| apiKey | string | API-ключ | Да | API-ключ вы можете найти в разделе «С Эмулятсфакпросов»Скем «С Инструкиието API»С |

## Пример на PHP

## Пример на PHP

$<$ ?php
\$curl = curl_init();
curl_setup_array(\$curl, array(
CURLOPT_URL == ?dips://admin.p1sms.ru/apiUsers/getUserBalanceInfo?apiKey=AbCd*******,
CURLOPT_RETURNTRANSFER == true,
CURLOPT_ENCODING == \},
CURLOPT_MAXREDIRS == 10,
CURLOPT_TIMEOUT == 0,
CURLOPT_FOLLOWLOCATION == true,
CURLOPT_HTTP_VERSION == CURL_HTTP_VERSION_1_1,
CURLOPT_CUSTOMREQUEST == 'GET';
\};
\$response = curl_exec(\$curl);
curl_close(\$curl);
echo \$response;

## Пример ответа

## Пример ответа

\{
"status": "success",
"data": "15.0000"

---

# Page 30/30

.