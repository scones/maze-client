Rails.application.routes.draw do
  match '*path' => redirect('/'), via: :get
end

