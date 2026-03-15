<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Http\Request;

class PageController extends Controller
{
    // GET /menu-boards
    public function index()
    {
        $pages = Page::orderBy('updated_at', 'desc')->get();
        return view('menu-boards', compact('pages'));
    }

    // GET /builder  (new blank page)
    public function builder()
    {
        return view('builder', ['page' => null]);
    }

    // GET /builder/{id}  (load existing page)
    public function edit($id)
    {
        $page = Page::findOrFail($id);
        return view('builder', compact('page'));
    }

    // POST /api/pages/save
    public function save(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'html' => 'nullable|string',
            'css'  => 'nullable|string',
        ]);

        $id = $request->input('id');

        if ($id) {
            // Update existing
            $page = Page::findOrFail($id);
            $page->update([
                'name'      => $request->name,
                'html'      => $request->html,
                'css'       => $request->css,
                'thumbnail' => $request->thumbnail,
                'status'    => $request->input('status', $page->status),
            ]);
        } else {
            // Create new
            $page = Page::create([
                'name'      => $request->name,
                'slug'      => Page::generateSlug($request->name),
                'html'      => $request->html,
                'css'       => $request->css,
                'thumbnail' => $request->thumbnail,
                'status'    => 'draft',
            ]);
        }

        return response()->json([
            'success' => true,
            'page'    => $page,
        ]);
    }

    // GET /api/pages/{id}
    public function load($id)
    {
        $page = Page::findOrFail($id);
        return response()->json($page);
    }

    // DELETE /api/pages/{id}
    public function destroy($id)
    {
        Page::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }

    // POST /api/pages/{id}/duplicate
    public function duplicate($id)
    {
        $original = Page::findOrFail($id);
        $newName  = $original->name . ' (Copy)';

        $copy = Page::create([
            'name'      => $newName,
            'slug'      => Page::generateSlug($newName),
            'html'      => $original->html,
            'css'       => $original->css,
            'thumbnail' => $original->thumbnail,
            'status'    => 'draft',
        ]);

        return response()->json([
            'success' => true,
            'page'    => $copy,
        ]);
    }

    // PATCH /api/pages/{id}/status
    public function updateStatus(Request $request, $id)
    {
        $page = Page::findOrFail($id);
        $page->update(['status' => $request->status]);
        return response()->json(['success' => true, 'page' => $page]);
    }

    // PATCH /api/pages/{id}/rename
    public function rename(Request $request, $id)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $page = Page::findOrFail($id);
        $page->update([
            'name' => $request->name,
            'slug' => Page::generateSlug($request->name),
        ]);
        return response()->json(['success' => true, 'page' => $page]);
    }
}