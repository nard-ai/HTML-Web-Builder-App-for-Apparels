<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PageController;

// ── VIEWS ──────────────────────────────────────────
Route::get('/', fn() => redirect('/menu-boards'));

Route::get('/menu-boards', [PageController::class, 'index'])->name('menu-boards');

Route::get('/builder', [PageController::class, 'builder'])->name('builder.new');

Route::get('/builder/{id}', [PageController::class, 'edit'])->name('builder.edit');

Route::get('/report', function () {return view('report');});

// Route::get('/', function () {
//     return view('landingpage');
// });

// ── API ────────────────────────────────────────────
Route::prefix('api/pages')->group(function () {

    Route::post('/save',              [PageController::class, 'save']);
    Route::get('/{id}',               [PageController::class, 'load']);
    Route::delete('/{id}',            [PageController::class, 'destroy']);
    Route::post('/{id}/duplicate',    [PageController::class, 'duplicate']);
    Route::patch('/{id}/status',      [PageController::class, 'updateStatus']);
    Route::patch('/{id}/rename',      [PageController::class, 'rename']);

});