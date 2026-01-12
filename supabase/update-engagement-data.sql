-- Update engagement data for session_templates and courses
-- Generated: 2026-01-12T11:10:55.435Z
--
-- This script normalizes engagement metrics to create realistic distributions:
-- - 80% of creator_hours reflect beginner/intermediate practitioners
-- - Varied karma, saves, completions reflecting content lifecycle stages
-- - Some content is new (low engagement), some established, some popular

BEGIN;

-- =============================================
-- SESSION TEMPLATES
-- =============================================

UPDATE public.session_templates
SET creator_hours = 10,
    karma = 39,
    saves = 75,
    completions = 159
WHERE id = 'fc68ad3a-1af8-5c3f-beda-0b61f80ede74';

UPDATE public.session_templates
SET creator_hours = 728,
    karma = 18,
    saves = 14,
    completions = 57
WHERE id = '6f3836dd-7fb6-5fe4-81cb-92cf6942650f';

UPDATE public.session_templates
SET creator_hours = 76,
    karma = 39,
    saves = 89,
    completions = 112
WHERE id = '5daf3801-206f-5b47-8323-728e7f22c6d4';

UPDATE public.session_templates
SET creator_hours = 263,
    karma = 1,
    saves = 1,
    completions = 10
WHERE id = '86273986-4db7-5e9d-8a32-235b6bb9051b';

UPDATE public.session_templates
SET creator_hours = 480,
    karma = 130,
    saves = 148,
    completions = 303
WHERE id = 'd289969c-c889-5a3f-b001-4ca35ea11364';

UPDATE public.session_templates
SET creator_hours = 246,
    karma = 3,
    saves = 0,
    completions = 5
WHERE id = 'fbeeac9a-dae8-5d95-98d6-5c98205b7798';

UPDATE public.session_templates
SET creator_hours = 87,
    karma = 161,
    saves = 160,
    completions = 815
WHERE id = '25961543-231d-5d56-99bd-2e44f0209895';

UPDATE public.session_templates
SET creator_hours = 56,
    karma = 5,
    saves = 6,
    completions = 42
WHERE id = '2cd4aa9c-31fc-50c3-b165-f1f39622db66';

UPDATE public.session_templates
SET creator_hours = 232,
    karma = 66,
    saves = 33,
    completions = 114
WHERE id = 'b73d6c0b-e6bb-51d1-99b9-ae637e6e6788';

UPDATE public.session_templates
SET creator_hours = 100,
    karma = 94,
    saves = 45,
    completions = 316
WHERE id = 'da132f0b-315a-5a9a-84e2-c564badf3129';

UPDATE public.session_templates
SET creator_hours = 651,
    karma = 141,
    saves = 187,
    completions = 524
WHERE id = '69aa045b-ced8-55de-b651-45b0bb027eff';

UPDATE public.session_templates
SET creator_hours = 504,
    karma = 48,
    saves = 45,
    completions = 153
WHERE id = '37d7e48f-02db-5f4f-b451-56496f1f8b99';

UPDATE public.session_templates
SET creator_hours = 2391,
    karma = 77,
    saves = 91,
    completions = 308
WHERE id = 'dab9c033-87d9-59da-ab83-7f6755f0584e';

UPDATE public.session_templates
SET creator_hours = 100,
    karma = 111,
    saves = 74,
    completions = 205
WHERE id = '9cc6f490-69a7-58d7-91d6-e4b8dd5635a4';

UPDATE public.session_templates
SET creator_hours = 292,
    karma = 86,
    saves = 196,
    completions = 210
WHERE id = '195ed675-c8a9-508b-90f9-be171a456057';

UPDATE public.session_templates
SET creator_hours = 47,
    karma = 58,
    saves = 106,
    completions = 311
WHERE id = '9a7b11e2-e638-577f-a6f2-f38c55d9bc64';

UPDATE public.session_templates
SET creator_hours = 382,
    karma = 67,
    saves = 61,
    completions = 289
WHERE id = 'ed02cf3d-7920-5adc-97f6-9c0752ff84bf';

UPDATE public.session_templates
SET creator_hours = 268,
    karma = 69,
    saves = 124,
    completions = 335
WHERE id = '0708b6e0-2a2a-5224-83a3-f5e6f27826c2';

UPDATE public.session_templates
SET creator_hours = 601,
    karma = 43,
    saves = 59,
    completions = 110
WHERE id = '9ad841f3-2b4e-5d7b-ad46-7c85b3b348fe';

UPDATE public.session_templates
SET creator_hours = 17,
    karma = 70,
    saves = 22,
    completions = 271
WHERE id = 'd8f32e38-cf88-59e4-b651-1779f51daa64';

UPDATE public.session_templates
SET creator_hours = 41,
    karma = 120,
    saves = 81,
    completions = 602
WHERE id = '75d932c0-905b-516c-88bd-d0d33474fb80';

UPDATE public.session_templates
SET creator_hours = 5,
    karma = 4,
    saves = 5,
    completions = 68
WHERE id = '1d2392e2-5557-5316-9c51-acae7dd1893c';

UPDATE public.session_templates
SET creator_hours = 650,
    karma = 5,
    saves = 5,
    completions = 6
WHERE id = 'a26374bf-0cde-50ca-b7d7-6c2e9c1b8809';

UPDATE public.session_templates
SET creator_hours = 197,
    karma = 27,
    saves = 28,
    completions = 98
WHERE id = '6fef5dee-f672-5157-b60d-55482f8a75ef';

UPDATE public.session_templates
SET creator_hours = 406,
    karma = 0,
    saves = 0,
    completions = 46
WHERE id = '5522a7d5-f759-55a1-821f-16f51474a0dd';

UPDATE public.session_templates
SET creator_hours = 914,
    karma = 87,
    saves = 104,
    completions = 366
WHERE id = '1e8003dc-66cb-5652-b1e6-262336d7af42';

UPDATE public.session_templates
SET creator_hours = 206,
    karma = 0,
    saves = 0,
    completions = 2
WHERE id = '42d27598-5174-5032-96af-fa584ed40c42';

UPDATE public.session_templates
SET creator_hours = 740,
    karma = 11,
    saves = 13,
    completions = 37
WHERE id = 'd735de8a-647b-5938-86e4-2d7ee0f3fa36';

UPDATE public.session_templates
SET creator_hours = 208,
    karma = 135,
    saves = 55,
    completions = 578
WHERE id = 'a8e8648d-71cd-5feb-a142-40ce95611ba9';

UPDATE public.session_templates
SET creator_hours = 123,
    karma = 303,
    saves = 616,
    completions = 643
WHERE id = '9ce4c9e5-0fc0-5a88-a038-7f93e68e1f66';

UPDATE public.session_templates
SET creator_hours = 246,
    karma = 241,
    saves = 509,
    completions = 700
WHERE id = 'cfe26161-4fe0-5112-aac3-2732cf8e0ee4';

UPDATE public.session_templates
SET creator_hours = 2836,
    karma = 138,
    saves = 118,
    completions = 443
WHERE id = '10da8843-28b7-5329-b76f-1263c79ac9e7';

UPDATE public.session_templates
SET creator_hours = 52,
    karma = 121,
    saves = 97,
    completions = 1075
WHERE id = '17bc4ba9-61c4-5618-97f6-f69c4b04227f';

UPDATE public.session_templates
SET creator_hours = 12,
    karma = 25,
    saves = 33,
    completions = 157
WHERE id = 'c342e109-39b7-59b7-b4f2-f650053b69a5';

UPDATE public.session_templates
SET creator_hours = 634,
    karma = 7,
    saves = 17,
    completions = 39
WHERE id = '6ea3eb81-e260-573b-a656-4d4b600e85b9';

UPDATE public.session_templates
SET creator_hours = 26,
    karma = 36,
    saves = 35,
    completions = 157
WHERE id = 'bd30de70-562d-5b66-ada4-b59d620f8b27';

UPDATE public.session_templates
SET creator_hours = 185,
    karma = 0,
    saves = 6,
    completions = 20
WHERE id = 'bbf74063-e06a-556c-99a9-0defa40c2b28';

UPDATE public.session_templates
SET creator_hours = 24,
    karma = 40,
    saves = 11,
    completions = 308
WHERE id = 'e3f2f11f-5eed-50c0-b722-80e868e19e41';

UPDATE public.session_templates
SET creator_hours = 422,
    karma = 22,
    saves = 16,
    completions = 154
WHERE id = 'c01ce1ed-9e86-57e0-9066-636eccdc62aa';

UPDATE public.session_templates
SET creator_hours = 706,
    karma = 0,
    saves = 2,
    completions = 7
WHERE id = '875efa95-fe25-5782-aa16-b68eca2e1a6d';

UPDATE public.session_templates
SET creator_hours = 59,
    karma = 155,
    saves = 81,
    completions = 1371
WHERE id = '8b36d726-1ca7-5dca-bb61-7838add544a6';

UPDATE public.session_templates
SET creator_hours = 70,
    karma = 7,
    saves = 6,
    completions = 9
WHERE id = '9d343cd0-e6e0-5d13-83a2-ef523548d463';

UPDATE public.session_templates
SET creator_hours = 52,
    karma = 168,
    saves = 214,
    completions = 679
WHERE id = '85afc224-db1c-505a-911f-af9b62169667';

UPDATE public.session_templates
SET creator_hours = 282,
    karma = 167,
    saves = 236,
    completions = 585
WHERE id = '212ad590-b473-5b37-90f5-68c904d68bb3';

UPDATE public.session_templates
SET creator_hours = 206,
    karma = 256,
    saves = 234,
    completions = 1797
WHERE id = 'b83c63c7-a4aa-5354-8906-5b6005727698';

UPDATE public.session_templates
SET creator_hours = 1982,
    karma = 26,
    saves = 26,
    completions = 193
WHERE id = 'a059bd1c-33a8-5b48-a6e5-94a9bb4897fa';

UPDATE public.session_templates
SET creator_hours = 60,
    karma = 68,
    saves = 72,
    completions = 352
WHERE id = '91bb6ed1-c148-590e-9a8f-fa7927726011';

UPDATE public.session_templates
SET creator_hours = 10,
    karma = 0,
    saves = 0,
    completions = 3
WHERE id = 'e8be87d2-7028-5dfd-a05f-08cf47d453cb';

UPDATE public.session_templates
SET creator_hours = 690,
    karma = 251,
    saves = 432,
    completions = 1030
WHERE id = '23c18c32-2e19-577e-8dc9-6fd45f2c2251';

UPDATE public.session_templates
SET creator_hours = 12,
    karma = 65,
    saves = 25,
    completions = 356
WHERE id = '6b9a3b54-328c-5ee4-9e71-71dd3c576c14';

UPDATE public.session_templates
SET creator_hours = 312,
    karma = 21,
    saves = 13,
    completions = 26
WHERE id = '82f1ea07-9cd0-50d6-ba6e-105ea5758a1a';

UPDATE public.session_templates
SET creator_hours = 2277,
    karma = 84,
    saves = 66,
    completions = 521
WHERE id = '42b70326-f9bb-59fc-b8e3-450260732e6b';

UPDATE public.session_templates
SET creator_hours = 220,
    karma = 42,
    saves = 61,
    completions = 158
WHERE id = 'af7fc0b7-5479-5524-9aa2-fff738871bc1';

UPDATE public.session_templates
SET creator_hours = 435,
    karma = 74,
    saves = 61,
    completions = 269
WHERE id = 'ad57fdfb-7072-5396-ba3f-665573d8f1ab';

UPDATE public.session_templates
SET creator_hours = 75,
    karma = 100,
    saves = 87,
    completions = 321
WHERE id = '58a356a6-56c4-5b32-af3e-02df17881ec5';

UPDATE public.session_templates
SET creator_hours = 64,
    karma = 3,
    saves = 3,
    completions = 3
WHERE id = 'b678a9f9-148e-507a-b5da-8702c70b30d0';

UPDATE public.session_templates
SET creator_hours = 592,
    karma = 57,
    saves = 91,
    completions = 375
WHERE id = 'e9555894-c141-5004-b154-20e0d95a68f7';

UPDATE public.session_templates
SET creator_hours = 247,
    karma = 153,
    saves = 158,
    completions = 922
WHERE id = '3d384978-8d7d-5a9a-b6fc-aae76b91c989';

UPDATE public.session_templates
SET creator_hours = 49,
    karma = 72,
    saves = 109,
    completions = 457
WHERE id = '3ce00183-fe57-5936-b160-6ebd015af449';

UPDATE public.session_templates
SET creator_hours = 97,
    karma = 5,
    saves = 4,
    completions = 49
WHERE id = '2ac8d941-c2c8-5e6b-8c06-ea5e4335e61c';

UPDATE public.session_templates
SET creator_hours = 531,
    karma = 5,
    saves = 2,
    completions = 5
WHERE id = '25db1dac-e22f-5cad-b0e3-b2b0dec420b7';

UPDATE public.session_templates
SET creator_hours = 23,
    karma = 56,
    saves = 19,
    completions = 173
WHERE id = '7c507cf5-6977-5ad4-beab-561f9a604974';

UPDATE public.session_templates
SET creator_hours = 556,
    karma = 50,
    saves = 35,
    completions = 134
WHERE id = 'a200ba1d-aa98-5f50-9625-e49067243bf0';

UPDATE public.session_templates
SET creator_hours = 759,
    karma = 13,
    saves = 6,
    completions = 75
WHERE id = 'a8786cfa-cc91-5546-997d-35c3cacf20c3';

UPDATE public.session_templates
SET creator_hours = 21,
    karma = 4,
    saves = 13,
    completions = 68
WHERE id = '7a1bd2c8-f1ec-5a8d-ad94-66b6576cff93';

UPDATE public.session_templates
SET creator_hours = 88,
    karma = 0,
    saves = 1,
    completions = 15
WHERE id = 'd76e0942-6721-5584-9de4-5bd13c5e8eb4';

UPDATE public.session_templates
SET creator_hours = 7,
    karma = 134,
    saves = 130,
    completions = 765
WHERE id = '103c4784-1c16-593f-bbb7-0583918ccd71';

UPDATE public.session_templates
SET creator_hours = 1033,
    karma = 66,
    saves = 75,
    completions = 621
WHERE id = '6d0b0ac0-ad69-570b-a4ba-858826adfa41';

UPDATE public.session_templates
SET creator_hours = 72,
    karma = 86,
    saves = 72,
    completions = 431
WHERE id = '52a3fad2-52b2-53c5-878e-e7d427a9c2a5';

UPDATE public.session_templates
SET creator_hours = 97,
    karma = 51,
    saves = 20,
    completions = 172
WHERE id = 'd28e54e4-293e-55ba-a7f7-bae9d13896f9';

UPDATE public.session_templates
SET creator_hours = 223,
    karma = 74,
    saves = 24,
    completions = 81
WHERE id = '66852697-fefe-5390-9670-4833c41b8eea';

UPDATE public.session_templates
SET creator_hours = 67,
    karma = 133,
    saves = 70,
    completions = 279
WHERE id = '9149185e-39d5-55fe-bcad-e76d1839402c';

UPDATE public.session_templates
SET creator_hours = 73,
    karma = 37,
    saves = 20,
    completions = 160
WHERE id = '71f3bafd-2f7d-5255-8c63-39739c01b8a8';

UPDATE public.session_templates
SET creator_hours = 283,
    karma = 1,
    saves = 2,
    completions = 5
WHERE id = '420b6c46-39e9-5812-8682-dfdd2eb60356';

UPDATE public.session_templates
SET creator_hours = 100,
    karma = 8,
    saves = 19,
    completions = 14
WHERE id = 'e39648a3-4c98-5747-9dc0-46d519b03dbc';

UPDATE public.session_templates
SET creator_hours = 417,
    karma = 3,
    saves = 2,
    completions = 22
WHERE id = '4dd7b7b7-d6ee-5e2f-8357-b5e11a9a6cad';

UPDATE public.session_templates
SET creator_hours = 86,
    karma = 83,
    saves = 83,
    completions = 597
WHERE id = '22c96d0d-a561-5d30-b5c1-2013524d2693';

UPDATE public.session_templates
SET creator_hours = 250,
    karma = 82,
    saves = 84,
    completions = 694
WHERE id = 'a741b174-1bab-507f-8f32-041dfbb5c995';

UPDATE public.session_templates
SET creator_hours = 665,
    karma = 120,
    saves = 106,
    completions = 796
WHERE id = '5c6666fd-987c-5dd1-ba78-920e6d62e70d';

UPDATE public.session_templates
SET creator_hours = 76,
    karma = 40,
    saves = 22,
    completions = 120
WHERE id = 'efd79817-49ce-58a5-8867-348a85f2b482';

UPDATE public.session_templates
SET creator_hours = 2091,
    karma = 18,
    saves = 23,
    completions = 213
WHERE id = 'f3c32b77-4fa5-5897-b4e0-b3e21c4831a5';

UPDATE public.session_templates
SET creator_hours = 338,
    karma = 54,
    saves = 34,
    completions = 159
WHERE id = 'f81cffe1-7656-57b7-9d15-f104c767effb';

UPDATE public.session_templates
SET creator_hours = 24,
    karma = 274,
    saves = 331,
    completions = 1411
WHERE id = '206242ad-04f3-54f1-818c-b37f9919dc4b';

UPDATE public.session_templates
SET creator_hours = 744,
    karma = 90,
    saves = 72,
    completions = 427
WHERE id = '7281b00b-3fb8-52d1-b2ba-96d44323ff43';

UPDATE public.session_templates
SET creator_hours = 652,
    karma = 44,
    saves = 36,
    completions = 233
WHERE id = '0d76f0f2-e84d-5b42-a87b-4f5a85314229';

UPDATE public.session_templates
SET creator_hours = 278,
    karma = 287,
    saves = 197,
    completions = 1405
WHERE id = '27e32ce9-bca2-51cb-8f46-d82fe94b3977';

UPDATE public.session_templates
SET creator_hours = 12,
    karma = 35,
    saves = 24,
    completions = 185
WHERE id = '8e52d4a7-0ebf-5b29-b14f-5ecc0e4344b5';

UPDATE public.session_templates
SET creator_hours = 8,
    karma = 4,
    saves = 5,
    completions = 42
WHERE id = 'e97c686c-0795-5c12-8520-0ce2a35cee1f';

UPDATE public.session_templates
SET creator_hours = 56,
    karma = 1,
    saves = 0,
    completions = 4
WHERE id = 'b0c12d46-67b7-5f7b-9c49-e5e793c1609f';

UPDATE public.session_templates
SET creator_hours = 20,
    karma = 0,
    saves = 1,
    completions = 2
WHERE id = '5629f03e-ade6-5be5-a039-58eeed17ee00';

UPDATE public.session_templates
SET creator_hours = 52,
    karma = 1,
    saves = 0,
    completions = 10
WHERE id = 'cadd3af1-196d-5881-be1a-7277ce17caed';

UPDATE public.session_templates
SET creator_hours = 3265,
    karma = 103,
    saves = 148,
    completions = 530
WHERE id = '708980d4-ec43-58cd-aa7f-88a05bcecd8b';

UPDATE public.session_templates
SET creator_hours = 445,
    karma = 54,
    saves = 86,
    completions = 523
WHERE id = '92f1ae01-4842-52cb-8025-380797a73ddf';

UPDATE public.session_templates
SET creator_hours = 7,
    karma = 4,
    saves = 2,
    completions = 11
WHERE id = '84e397ff-5b5e-5550-a4d3-08060ec5b41a';

UPDATE public.session_templates
SET creator_hours = 326,
    karma = 68,
    saves = 99,
    completions = 418
WHERE id = '3d3b18a0-f380-5a89-9d72-1dcd67837651';

UPDATE public.session_templates
SET creator_hours = 231,
    karma = 14,
    saves = 15,
    completions = 40
WHERE id = '71ea58c1-997f-5587-ab14-9bc0fe239c0c';

UPDATE public.session_templates
SET creator_hours = 33,
    karma = 3,
    saves = 5,
    completions = 0
WHERE id = '401d079c-6fd2-57f1-9205-4beb4d672857';

UPDATE public.session_templates
SET creator_hours = 64,
    karma = 11,
    saves = 9,
    completions = 57
WHERE id = '8bb53d57-b78e-5d73-b51a-38459ffd126d';

UPDATE public.session_templates
SET creator_hours = 142,
    karma = 45,
    saves = 31,
    completions = 108
WHERE id = '07a4e22f-513b-5d4c-b6d1-dfc32e122cef';

UPDATE public.session_templates
SET creator_hours = 73,
    karma = 6,
    saves = 0,
    completions = 10
WHERE id = '178bf97b-80bd-5b82-82b9-4b5d08c508e0';

UPDATE public.session_templates
SET creator_hours = 14,
    karma = 220,
    saves = 307,
    completions = 1254
WHERE id = '7621675a-820a-5776-a413-ad8c1dcbf518';

UPDATE public.session_templates
SET creator_hours = 179,
    karma = 6,
    saves = 1,
    completions = 31
WHERE id = '3c201219-572c-55d4-b28d-cba8184344f1';

UPDATE public.session_templates
SET creator_hours = 26,
    karma = 28,
    saves = 20,
    completions = 97
WHERE id = '7ecba322-0673-57ec-bbcd-b305e2427c0a';

UPDATE public.session_templates
SET creator_hours = 453,
    karma = 131,
    saves = 255,
    completions = 844
WHERE id = '7b157897-55e9-5a1d-a1a4-7adcc4a7b1bc';

UPDATE public.session_templates
SET creator_hours = 85,
    karma = 22,
    saves = 31,
    completions = 245
WHERE id = '3684bf02-798c-51d8-b40b-c9ffad9527ed';

UPDATE public.session_templates
SET creator_hours = 69,
    karma = 4,
    saves = 0,
    completions = 15
WHERE id = 'e78ce4f7-f256-5f8c-82aa-e1ca37c5bd45';

UPDATE public.session_templates
SET creator_hours = 308,
    karma = 72,
    saves = 127,
    completions = 300
WHERE id = '8bbd3a72-bfab-5c80-bfde-929e7d5aa8fb';

UPDATE public.session_templates
SET creator_hours = 25,
    karma = 0,
    saves = 3,
    completions = 20
WHERE id = 'adf878d9-814a-5588-aa8e-c930e8df786e';

UPDATE public.session_templates
SET creator_hours = 498,
    karma = 85,
    saves = 79,
    completions = 335
WHERE id = '84976f67-20ae-5594-98e7-b1cfde246493';

UPDATE public.session_templates
SET creator_hours = 105,
    karma = 170,
    saves = 193,
    completions = 382
WHERE id = '6c2763c5-e7f0-56a5-8a5e-a4e67610d600';

UPDATE public.session_templates
SET creator_hours = 28,
    karma = 39,
    saves = 21,
    completions = 227
WHERE id = '894cacc0-2b2b-479a-a56e-1f060eb77d5f';

UPDATE public.session_templates
SET creator_hours = 96,
    karma = 46,
    saves = 23,
    completions = 229
WHERE id = 'b4f9b6a2-0728-4dfb-b64a-699d313090d3';

UPDATE public.session_templates
SET creator_hours = 117,
    karma = 8,
    saves = 15,
    completions = 35
WHERE id = 'bd4db33a-cada-423d-88d1-42b35a1e8680';

UPDATE public.session_templates
SET creator_hours = 635,
    karma = 104,
    saves = 141,
    completions = 450
WHERE id = '8e62e5d9-a6a7-43d1-9389-57d1689bdb89';

UPDATE public.session_templates
SET creator_hours = 21,
    karma = 4,
    saves = 2,
    completions = 55
WHERE id = '1554eb64-81a0-4f0a-b697-5feb97edd461';

UPDATE public.session_templates
SET creator_hours = 96,
    karma = 5,
    saves = 11,
    completions = 62
WHERE id = 'd3523dac-9234-4f40-a9b3-e6e1469b2417';

UPDATE public.session_templates
SET creator_hours = 654,
    karma = 199,
    saves = 155,
    completions = 587
WHERE id = '82306811-38ed-48e7-ac9c-5dac04e82199';

UPDATE public.session_templates
SET creator_hours = 4109,
    karma = 0,
    saves = 2,
    completions = 28
WHERE id = '11903496-046f-46be-813c-eb95b4b2a2e6';

UPDATE public.session_templates
SET creator_hours = 15,
    karma = 113,
    saves = 310,
    completions = 581
WHERE id = '043805c6-eb47-40f8-ac20-822272ce7b4a';

UPDATE public.session_templates
SET creator_hours = 291,
    karma = 30,
    saves = 45,
    completions = 121
WHERE id = 'c06533bb-00f8-4ac9-92b1-21cbe9e27c47';

UPDATE public.session_templates
SET creator_hours = 39,
    karma = 104,
    saves = 115,
    completions = 777
WHERE id = 'ee75236f-649b-49f4-b7c6-0101cf393318';

UPDATE public.session_templates
SET creator_hours = 137,
    karma = 9,
    saves = 28,
    completions = 63
WHERE id = '6fe54d01-4014-439f-9ddc-96a85a0596b7';

UPDATE public.session_templates
SET creator_hours = 29,
    karma = 96,
    saves = 58,
    completions = 389
WHERE id = '8f13a170-29ca-4912-ad87-dc88baa584ce';

UPDATE public.session_templates
SET creator_hours = 718,
    karma = 5,
    saves = 3,
    completions = 44
WHERE id = 'd0da3c75-445c-452d-b18d-b7feb16c59e0';

UPDATE public.session_templates
SET creator_hours = 60,
    karma = 70,
    saves = 67,
    completions = 490
WHERE id = 'e75a8a9b-8167-4afd-bd7d-a12b94b07eea';

UPDATE public.session_templates
SET creator_hours = 721,
    karma = 2,
    saves = 0,
    completions = 39
WHERE id = 'df5836ef-d43f-4728-9d14-91976c4e419d';

UPDATE public.session_templates
SET creator_hours = 558,
    karma = 63,
    saves = 56,
    completions = 491
WHERE id = 'e2c97726-299a-4464-b00f-767e72f03eaf';

UPDATE public.session_templates
SET creator_hours = 10,
    karma = 123,
    saves = 80,
    completions = 221
WHERE id = 'd779da8d-bab4-4477-9f74-85c7177599b9';

UPDATE public.session_templates
SET creator_hours = 154,
    karma = 167,
    saves = 70,
    completions = 847
WHERE id = '6f6599d4-f105-4657-8d91-7295b798418b';

UPDATE public.session_templates
SET creator_hours = 52,
    karma = 60,
    saves = 54,
    completions = 108
WHERE id = '086b2d5d-e459-4ec0-ba28-79d82ba48614';

UPDATE public.session_templates
SET creator_hours = 85,
    karma = 56,
    saves = 48,
    completions = 414
WHERE id = '13f3327d-8597-4b12-b216-72fa6f743a57';

UPDATE public.session_templates
SET creator_hours = 53,
    karma = 168,
    saves = 161,
    completions = 563
WHERE id = '562615e4-882a-44b8-8215-716039379d81';

UPDATE public.session_templates
SET creator_hours = 52,
    karma = 71,
    saves = 106,
    completions = 237
WHERE id = '381c5550-28c9-4ca7-97c2-066618fc4324';

UPDATE public.session_templates
SET creator_hours = 262,
    karma = 346,
    saves = 280,
    completions = 1337
WHERE id = 'abb1bdbf-a010-4d76-b8b4-0949579d189a';

UPDATE public.session_templates
SET creator_hours = 3001,
    karma = 187,
    saves = 309,
    completions = 539
WHERE id = '8677ed85-d81b-42ff-94e4-47e6584903a6';

UPDATE public.session_templates
SET creator_hours = 51,
    karma = 55,
    saves = 11,
    completions = 104
WHERE id = 'deead261-4d65-4686-bcf0-c9b237ac58f7';

UPDATE public.session_templates
SET creator_hours = 64,
    karma = 2,
    saves = 6,
    completions = 20
WHERE id = '6a99d585-5b41-465e-93ca-57d6ccc2f7bc';

UPDATE public.session_templates
SET creator_hours = 318,
    karma = 27,
    saves = 31,
    completions = 100
WHERE id = '4e500d0e-7c5d-449f-a244-0805b58f2666';

UPDATE public.session_templates
SET creator_hours = 64,
    karma = 47,
    saves = 25,
    completions = 204
WHERE id = '5e28a076-efed-4ef4-95d2-0371c00d5067';

UPDATE public.session_templates
SET creator_hours = 69,
    karma = 98,
    saves = 65,
    completions = 572
WHERE id = '3b166906-85c0-4bac-b9da-80da405975e1';

UPDATE public.session_templates
SET creator_hours = 245,
    karma = 51,
    saves = 206,
    completions = 294
WHERE id = 'd1753962-35a1-4250-90dc-7410d9671131';

UPDATE public.session_templates
SET creator_hours = 31,
    karma = 102,
    saves = 323,
    completions = 403
WHERE id = 'fbf08369-1038-4871-9eae-7ceff4e27ccc';

UPDATE public.session_templates
SET creator_hours = 294,
    karma = 134,
    saves = 101,
    completions = 352
WHERE id = 'eed417ab-0080-4db5-a824-f2143dbc68fc';

UPDATE public.session_templates
SET creator_hours = 58,
    karma = 12,
    saves = 7,
    completions = 61
WHERE id = '8965fad0-7558-40b3-8614-3c6e4016a898';

UPDATE public.session_templates
SET creator_hours = 476,
    karma = 54,
    saves = 37,
    completions = 164
WHERE id = 'f9d95a79-040d-422b-ad8a-ff78a79e2a8b';

UPDATE public.session_templates
SET creator_hours = 88,
    karma = 41,
    saves = 55,
    completions = 162
WHERE id = '679669cb-391b-4b15-9783-e15cc03610fe';

UPDATE public.session_templates
SET creator_hours = 37,
    karma = 62,
    saves = 99,
    completions = 354
WHERE id = '4cdbc3b8-098f-4fb8-9665-b7aca3c045d8';

UPDATE public.session_templates
SET creator_hours = 20,
    karma = 37,
    saves = 14,
    completions = 348
WHERE id = 'b9f3ef6e-9108-4535-a70a-b7742af86d49';

UPDATE public.session_templates
SET creator_hours = 3721,
    karma = 22,
    saves = 8,
    completions = 26
WHERE id = '177a5b67-8e7d-4198-8004-300d4a9130fb';

UPDATE public.session_templates
SET creator_hours = 419,
    karma = 1,
    saves = 2,
    completions = 34
WHERE id = 'b240aa81-e2c8-47a7-8a59-14fbb0f236b4';

UPDATE public.session_templates
SET creator_hours = 68,
    karma = 7,
    saves = 0,
    completions = 0
WHERE id = '8f713a16-5cea-4a92-83a8-afd88292599a';

UPDATE public.session_templates
SET creator_hours = 179,
    karma = 10,
    saves = 15,
    completions = 53
WHERE id = 'ee83185d-6e04-4209-80f0-2bc90dfe4c32';

UPDATE public.session_templates
SET creator_hours = 42,
    karma = 97,
    saves = 65,
    completions = 665
WHERE id = 'db8f3bc2-f7ec-43d5-add1-86d97758e760';

UPDATE public.session_templates
SET creator_hours = 60,
    karma = 23,
    saves = 2,
    completions = 67
WHERE id = '3c986d1e-e3b3-4bb1-9932-613528967507';

UPDATE public.session_templates
SET creator_hours = 468,
    karma = 171,
    saves = 141,
    completions = 812
WHERE id = '3bedfc25-67af-44bc-beae-532ac9141243';

UPDATE public.session_templates
SET creator_hours = 19,
    karma = 164,
    saves = 97,
    completions = 826
WHERE id = '994cdffb-6482-4bbf-9fed-4181a48bbc8f';

UPDATE public.session_templates
SET creator_hours = 235,
    karma = 26,
    saves = 16,
    completions = 29
WHERE id = 'ec604c19-4c31-4fb9-8571-0f6d373fc4b1';

UPDATE public.session_templates
SET creator_hours = 37,
    karma = 1,
    saves = 0,
    completions = 14
WHERE id = '904e0079-d4a6-4800-94e9-5a4b9725bff8';

UPDATE public.session_templates
SET creator_hours = 326,
    karma = 28,
    saves = 22,
    completions = 257
WHERE id = '34e4d988-d69d-4349-bebe-b1f2a2f5d7bd';

UPDATE public.session_templates
SET creator_hours = 26,
    karma = 59,
    saves = 63,
    completions = 510
WHERE id = '25a87790-3cea-408e-9b57-35d6d3e10c72';

UPDATE public.session_templates
SET creator_hours = 50,
    karma = 14,
    saves = 11,
    completions = 53
WHERE id = '0559d262-9ab2-4947-982e-3f369a321c2c';


-- =============================================
-- COURSES
-- =============================================

UPDATE public.courses
SET karma = 22,
    saves = 16
WHERE id = 'fa40ccc4-0952-5a92-915c-df640fdcba2a';

UPDATE public.courses
SET karma = 12,
    saves = 18
WHERE id = 'cb0db006-b010-56be-8680-608aa5c23b1f';

UPDATE public.courses
SET karma = 133,
    saves = 301
WHERE id = 'd2575386-6ae4-5ba3-b2a9-28eabc1a594f';

UPDATE public.courses
SET karma = 128,
    saves = 85
WHERE id = '5a703de3-14ca-575d-9da5-9b02d8af6d69';

UPDATE public.courses
SET karma = 58,
    saves = 51
WHERE id = '97af431a-cba0-5f07-9357-c876f989ef99';

UPDATE public.courses
SET karma = 111,
    saves = 104
WHERE id = '82db02f2-9c83-5b5a-bfdf-4e8eb4adf883';

UPDATE public.courses
SET karma = 5,
    saves = 7
WHERE id = 'd870dbc4-6eae-53c9-8fed-e56943657b61';

UPDATE public.courses
SET karma = 3,
    saves = 7
WHERE id = '6fade3f7-5ff2-5151-bdc4-606289247044';

UPDATE public.courses
SET karma = 10,
    saves = 4
WHERE id = '2035b062-2035-577e-b4a5-226b2b328ad0';

UPDATE public.courses
SET karma = 60,
    saves = 68
WHERE id = '0f459ba4-ab9d-5c23-9a72-18260ea85e91';

UPDATE public.courses
SET karma = 39,
    saves = 102
WHERE id = '52ab5d0c-1ecf-520c-86fe-5bd260921253';

UPDATE public.courses
SET karma = 45,
    saves = 38
WHERE id = '1ab09eff-e7a8-594a-9938-56cd61bd451c';

UPDATE public.courses
SET karma = 1,
    saves = 1
WHERE id = 'b520c0ed-637c-5f0e-ba34-4ae6e671f491';

UPDATE public.courses
SET karma = 3,
    saves = 0
WHERE id = '2cc5eb37-2b12-5862-aac8-69fe3f8d4eaf';

UPDATE public.courses
SET karma = 20,
    saves = 3
WHERE id = '5a849893-765d-5128-9e99-d9b9e44470c7';

UPDATE public.courses
SET karma = 28,
    saves = 10
WHERE id = '3c02459a-7f51-5305-8afa-bb995b4e7688';

UPDATE public.courses
SET karma = 128,
    saves = 304
WHERE id = '19ed8f95-3828-5460-a16c-d2966134ba0c';

UPDATE public.courses
SET karma = 148,
    saves = 127
WHERE id = 'a82d6f56-d71a-5123-abb4-0a9f02426fb2';

UPDATE public.courses
SET karma = 5,
    saves = 1
WHERE id = '847e4c86-a947-5177-b845-4d4ccd1b47d0';

UPDATE public.courses
SET karma = 1,
    saves = 0
WHERE id = 'a049da73-3662-5467-8a45-c50882b6e55f';

UPDATE public.courses
SET karma = 163,
    saves = 213
WHERE id = '29f11695-93d1-5a21-bd5f-8a7ce54a90f8';

UPDATE public.courses
SET karma = 55,
    saves = 36
WHERE id = 'f90dbf5a-0b5e-5d72-a3ca-2f32d3551a5b';

UPDATE public.courses
SET karma = 192,
    saves = 362
WHERE id = '3bbb4049-0c76-5045-bf67-7a511f3333cb';

UPDATE public.courses
SET karma = 160,
    saves = 166
WHERE id = 'c37a6e85-1b51-5d6a-a1c2-af12830e02cc';

UPDATE public.courses
SET karma = 29,
    saves = 27
WHERE id = '316b56e3-7849-5202-8778-cfd63b10a75f';

UPDATE public.courses
SET karma = 21,
    saves = 44
WHERE id = '25432daa-1a59-5b9d-8045-4f7401046aa5';

UPDATE public.courses
SET karma = 5,
    saves = 12
WHERE id = '1a03ff93-d284-5e93-8760-6bf76cf1c8f7';

UPDATE public.courses
SET karma = 40,
    saves = 38
WHERE id = 'd6c27769-fe58-5b62-b085-cb22e8d93f5b';

UPDATE public.courses
SET karma = 94,
    saves = 69
WHERE id = 'e0293672-a350-53b2-a689-9d725e9dba5f';

UPDATE public.courses
SET karma = 204,
    saves = 363
WHERE id = '2a011440-0fa7-5e07-b00f-92e9965ddc0c';

UPDATE public.courses
SET karma = 162,
    saves = 444
WHERE id = '3db86d13-91f1-5a68-a395-a256c15051cf';

UPDATE public.courses
SET karma = 145,
    saves = 213
WHERE id = '19300376-9927-5084-9eb8-076d2d56abe2';

UPDATE public.courses
SET karma = 188,
    saves = 262
WHERE id = '4d08dc4a-abbb-50fd-ad38-c44dbc6d0e98';

UPDATE public.courses
SET karma = 53,
    saves = 57
WHERE id = '1868cca5-4f02-5c60-a06b-18897536f729';

UPDATE public.courses
SET karma = 172,
    saves = 216
WHERE id = '510e2dde-e208-529c-970d-62b5dae592bd';

UPDATE public.courses
SET karma = 8,
    saves = 3
WHERE id = 'ee46ce3d-9693-56d0-90ad-ea693a292e16';

UPDATE public.courses
SET karma = 2,
    saves = 2
WHERE id = '132323ac-c3f1-5a75-8dc3-515e096f34a9';

UPDATE public.courses
SET karma = 22,
    saves = 48
WHERE id = '0748b44a-f409-5557-b023-6e019339b9e0';

UPDATE public.courses
SET karma = 23,
    saves = 3
WHERE id = '10b715ac-3b89-5c3d-9e84-269176788c3a';

UPDATE public.courses
SET karma = 3,
    saves = 2
WHERE id = 'd74b60c2-3a1f-5595-89a9-8a1885134674';

UPDATE public.courses
SET karma = 69,
    saves = 33
WHERE id = '2cf93b55-45f3-5d15-a50f-737ebe60f332';

UPDATE public.courses
SET karma = 3,
    saves = 7
WHERE id = 'f676712f-0bf8-5576-841c-08913c6476fc';

UPDATE public.courses
SET karma = 6,
    saves = 0
WHERE id = '32f9f3e0-2110-58e6-9900-c8817d707fe8';

UPDATE public.courses
SET karma = 0,
    saves = 0
WHERE id = '06b3a694-29a8-598d-945f-315b5e10a94a';

UPDATE public.courses
SET karma = 0,
    saves = 0
WHERE id = '464468eb-403f-508e-ae3c-397d92148eb0';

UPDATE public.courses
SET karma = 15,
    saves = 8
WHERE id = '3448c20f-5ee8-583c-87c8-9c02d6a96715';

UPDATE public.courses
SET karma = 3,
    saves = 1
WHERE id = '8c3304e8-b170-50f6-9478-a2e113b4c001';

UPDATE public.courses
SET karma = 35,
    saves = 39
WHERE id = 'd941376c-0001-52cb-8df8-4394d549f682';

UPDATE public.courses
SET karma = 70,
    saves = 43
WHERE id = '571f26cf-5766-5602-867e-d9dab5daed02';

UPDATE public.courses
SET karma = 66,
    saves = 20
WHERE id = 'fd1492e2-b8c9-50fb-be0c-e19396ea6040';

UPDATE public.courses
SET karma = 40,
    saves = 43
WHERE id = 'fad6cd63-e942-5ea9-b9c4-f7e45f6e99ac';

UPDATE public.courses
SET karma = 28,
    saves = 46
WHERE id = 'b76a28ff-db82-5697-b503-abde2a14242c';

UPDATE public.courses
SET karma = 21,
    saves = 30
WHERE id = 'b83b8661-37a6-5a25-98cf-5c04706f43aa';

UPDATE public.courses
SET karma = 14,
    saves = 22
WHERE id = '44e0592c-b0b2-5e4a-9a8b-625dc700d230';

UPDATE public.courses
SET karma = 22,
    saves = 6
WHERE id = '97038e8e-0b4b-5e11-bdcf-5bc6c8dbcdc3';

UPDATE public.courses
SET karma = 43,
    saves = 60
WHERE id = 'aea55591-363c-4128-a3b5-f0fb877e3c1a';

UPDATE public.courses
SET karma = 0,
    saves = 4
WHERE id = '68943f9d-90da-4edd-a0ad-8bd88f3d6045';

UPDATE public.courses
SET karma = 18,
    saves = 13
WHERE id = 'ffee7fb1-bf6f-4c2f-85ba-5a23e8b6d1b6';

UPDATE public.courses
SET karma = 64,
    saves = 62
WHERE id = 'b36f8f18-638f-4426-98ca-2ad9a276dee9';

UPDATE public.courses
SET karma = 134,
    saves = 186
WHERE id = '1dd85887-5d88-43f0-aeec-ef5513017b45';

UPDATE public.courses
SET karma = 7,
    saves = 1
WHERE id = 'cac7b1c9-5b8a-4434-acfb-c39d51d74c62';

UPDATE public.courses
SET karma = 3,
    saves = 6
WHERE id = '41ef7ffa-ca13-40ba-ac39-06d678da7e8b';

UPDATE public.courses
SET karma = 8,
    saves = 2
WHERE id = '66da1244-94c0-489a-80a4-64ff6306abed';

UPDATE public.courses
SET karma = 275,
    saves = 159
WHERE id = '5396aafc-1705-41d0-8cc0-c1e530d8b8b1';

COMMIT;

-- Verification queries
SELECT
  'Sessions' as type,
  COUNT(*) as total,
  AVG(karma)::int as avg_karma,
  AVG(saves)::int as avg_saves,
  AVG(completions)::int as avg_completions,
  COUNT(*) FILTER (WHERE creator_hours <= 100) as beginner_creators,
  COUNT(*) FILTER (WHERE creator_hours > 100 AND creator_hours <= 500) as intermediate_creators,
  COUNT(*) FILTER (WHERE creator_hours > 500) as advanced_creators
FROM public.session_templates;

SELECT
  'Courses' as type,
  COUNT(*) as total,
  AVG(karma)::int as avg_karma,
  AVG(saves)::int as avg_saves
FROM public.courses;
