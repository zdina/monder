import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.sql.Connection;
import java.util.Date;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.text.DateFormat;
import java.text.SimpleDateFormat;

import org.json.JSONObject;


public class Main {
	
	public static void main(String[] args) throws Exception {
		// Connect to Postgres db
		Class.forName("org.postgresql.Driver");
		Connection connection = null;
		connection = DriverManager.getConnection(
		   "jdbc:postgresql://localhost:5432/monderdb","dinazverinski", "");
		
		
		// Query RESTful API
		String title = "Titanic";
		
		URL url = new URL("http://www.omdbapi.com/?t=" + title + "&y=&plot=short&r=json");
		HttpURLConnection conn = (HttpURLConnection) url.openConnection();
		conn.setRequestMethod("GET");
		conn.setRequestProperty("Accept", "application/json");

		if (conn.getResponseCode() != 200) {
			throw new RuntimeException("Failed : HTTP error code : "
					+ conn.getResponseCode());
		}

		BufferedReader br = new BufferedReader(new InputStreamReader(
			(conn.getInputStream())));

		String output;
		System.out.println("Output from Server .... \n");
		if ((output = br.readLine()) != null) {
			System.out.println(output);
		
			JSONObject jo = new JSONObject(output);
			String id = jo.getString("imdbID");
			String actual_title = jo.getString("Title");
			int year = Integer.parseInt(jo.getString("Year"));
			int runtime = Integer.parseInt(jo.getString("Runtime").split(" ")[0]);
			String plot = jo.getString("Plot");
			double imdbRating = Double.parseDouble("imdbRating");
			int imdbVotes = Integer.parseInt("imdbVotes");
			
			String stm = "INSERT INTO movie (movie_id, title, year) VALUES(?, ?, ?)";
	        PreparedStatement pst = connection.prepareStatement(stm);
	        pst.setString(1, id); 
	        pst.setString(2, actual_title);
	        pst.setInt(3, year);
	        pst.executeUpdate();
			
		}

		conn.disconnect();
		
		
		// query
		
		
        
        
        
        // close postgres db
		connection.close();
	}

}
